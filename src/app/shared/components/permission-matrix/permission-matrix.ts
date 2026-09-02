import { Component, input, output, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { PERMISSION_OPTIONS } from '../../../core/constants/permissions.constant';
import { PageCatalogService } from '../../../core/services/page-catalog.service';
import { PageCatalogItemDto } from '../../../core/models/page-catalog-item.model';
import { BlockUiService } from '../../../core/services/block-ui.service';
import { Result } from '../../models/results/result.model';

// Master izin = her satirdaki ILK checkbox (goruntuluk/View). Label string'ine
// bagli kalmadan konuma gore belirliyoruz: permissionOptions[0].
// Master secili degilse digerleri disable; secim kalkinca digerleri de false + disable.
const NO_GROUP = '__none__';

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './permission-matrix.html',
  host: { 'class': 'block w-full' }
})
export class PermissionMatrixComponent {
  private translate = inject(TranslateService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private blockUi = inject(BlockUiService);
  private catalog = inject(PageCatalogService);

  targetId = input<string | 'null'>('null');
  fetchPermissions = input<((id: string) => Observable<Result<any>>) | null>(null);

  // Salt-okunur (goruntuleme) modu
  readonly = input<boolean>(false);

  permissionsChange = output<any[]>();
  groupPermissionsChange = output<any[]>();

  pages = signal<PageCatalogItemDto[]>([]);
  formReady = signal(false);

  permissionOptions = PERMISSION_OPTIONS;
  searchQuery = signal<string>('');

  matrixForm!: FormGroup;
  moduleForm!: FormGroup;

  // Form degerlerinin signal aynasi. "Tumunu Sec"in checked/indeterminate
  // durumunu buradan hesapliyoruz (zoneless'ta da reaktif calisir).
  private matrixSnapshot = signal<Record<string, Record<string, boolean>>>({});
  private moduleSnapshot = signal<Record<string, Record<string, boolean>>>({});

  modules = computed(() => {
    const keys = new Set<string>();
    for (const p of this.pages()) {
      if (p.groupKey && p.groupKey !== NO_GROUP) keys.add(p.groupKey);
    }
    return Array.from(keys).map(key => ({ key }));
  });

  singlePageKey = input<string | null>(null);
  singleGroupKey = input<string | null>(null);

  filteredPages = computed(() => {
    let pages = this.pages();
    const singlePage = this.singlePageKey();
    if (singlePage) {
      pages = pages.filter(p => p.pageKey === singlePage);
    }
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return pages;
    return pages.filter(p =>
      p.pageKey.toLowerCase().includes(query) ||
      this.t(p.key).toLowerCase().includes(query));
  });

  filteredModules = computed(() => {
    let modules = this.modules();
    const singleGroup = this.singleGroupKey();
    if (singleGroup) {
      modules = modules.filter(m => m.key === singleGroup);
    }
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return modules;
    return modules.filter(m =>
      m.key.toLowerCase().includes(query) ||
      this.t('MenuGroup.' + m.key).toLowerCase().includes(query));
  });

  constructor() {
    // 1. Target ID veya fetch fonksiyonu değiştiğinde veriyi çek
    effect(() => {
      if (!this.formReady()) return;
      const id = this.targetId();
      const fn = this.fetchPermissions();
      if (id && id !== 'null' && fn) {
        this.fetchAndFillPermissions(id, fn);
      } else {
        this.clearAllPermissions(true);
      }
    });

    // 2. Readonly durumu değiştiğinde form state'ini güncelle
    effect(() => {
      const isReadonly = this.readonly();
      if (this.formReady()) {
        this.applyReadonlyState(isReadonly);
      }
    });
  }

  ngOnInit(): void {
    const singlePage = this.singlePageKey();
    this.catalog.getSystemModules(singlePage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.isSuccess && res.value) {
          this.pages.set(res.value);
          this.buildForms();
          this.formReady.set(true);
        }
      });
  }

  t(key: string): string {
    return this.translate.instant(key);
  }

  private buildForms(): void {
    this.matrixForm = this.fb.group({});
    this.pages().forEach(page => {
      const g = this.fb.group({});
      this.permissionOptions.forEach(opt => g.addControl(opt.label, this.fb.control(false)));
      this.matrixForm.addControl(page.pageKey, g);
      this.setupViewPermissionDependency(g);
    });
    this.matrixForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.emitPagePermissions();
        this.matrixSnapshot.set(this.matrixForm.getRawValue());
      });

    this.moduleForm = this.fb.group({});
    this.modules().forEach(m => {
      const g = this.fb.group({});
      this.permissionOptions.forEach(opt => g.addControl(opt.label, this.fb.control(false)));
      this.moduleForm.addControl(m.key, g);
      this.setupViewPermissionDependency(g);
    });
    this.moduleForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.emitGroupPermissions();
        this.moduleSnapshot.set(this.moduleForm.getRawValue());
      });

    this.applyReadonlyState(this.readonly());
  }

  private refreshSnapshots(): void {
    if (this.matrixForm) this.matrixSnapshot.set(this.matrixForm.getRawValue());
    if (this.moduleForm) this.moduleSnapshot.set(this.moduleForm.getRawValue());
  }

  private applyReadonlyState(isReadonly: boolean): void {
    if (!this.matrixForm || !this.moduleForm) return;

    if (isReadonly) {
      this.matrixForm.disable({ emitEvent: false });
      this.moduleForm.disable({ emitEvent: false });
    } else {
      this.matrixForm.enable({ emitEvent: false });
      this.moduleForm.enable({ emitEvent: false });
      // enable() her seyi actigi icin View bagimliligini yeniden uygula:
      // View kapali satirlarda digerleri tekrar disable olsun.
      this.applyAllViewDependencies();
    }

    this.refreshSnapshots();
  }

  // Her satirdaki master = ilk izin secenegi (permissionOptions[0]).
  private get masterLabel(): string {
    return this.permissionOptions[0]?.label;
  }

  private setupViewPermissionDependency(group: FormGroup): void {
    // DIKKAT: label'lar nokta iceriyor (ör. 'Permission.View'). AbstractControl.get()
    // noktayi PATH ayraci sayar -> group.get('Permission.View') null doner.
    // Bu yuzden literal anahtarla group.controls[...] uzerinden erisiyoruz.
    const masterControl = group.controls[this.masterLabel];
    if (!masterControl) return;

    // Ilk kurulumda mevcut master degerine gore senkronize et
    this.syncViewDependency(group);

    masterControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncViewDependency(group));
  }

  // Tek bir grup icin: master isaretli degilse digerlerini temizle + disable et,
  // isaretliyse enable et. Tekrar tekrar cagrilabilecek sekilde ayirdik.
  private syncViewDependency(group: FormGroup): void {
    const masterControl = group.controls[this.masterLabel];
    if (!masterControl) return;
    if (this.readonly()) return; // Readonly moddaysa bağımlılık kontrolünü atla

    const masterChecked = !!masterControl.value;

    // Ilk secenek haric digerleri (konuma gore)
    this.permissionOptions.slice(1).forEach(opt => {
      const control = group.controls[opt.label];
      if (!control) return;
      if (masterChecked) {
        control.enable({ emitEvent: false });
      } else {
        control.setValue(false, { emitEvent: false });
        control.disable({ emitEvent: false });
      }
    });
  }

  // Tum sayfa ve modul gruplarina View bagimliligini uygular.
  private applyAllViewDependencies(): void {
    if (this.matrixForm) {
      this.pages().forEach(p => {
        const g = this.matrixForm.controls[p.pageKey] as FormGroup;
        if (g) this.syncViewDependency(g);
      });
    }
    if (this.moduleForm) {
      this.modules().forEach(m => {
        const g = this.moduleForm.controls[m.key] as FormGroup;
        if (g) this.syncViewDependency(g);
      });
    }
  }

  // Checkbox'in dogrudan (change) olayindan tetiklenir. valueChanges'e ek
  // olarak koyduk cunku bu yontem event.target.checked'i okur -> CVA/CD
  // zamanlamasindan bagimsiz olarak kesin calisir.
  // View uncheck -> digerleri false + disable. View check -> digerleri enable.
  // index: @for'daki $index. Sadece ilk checkbox (index === 0) master'dir.
  onPermissionCheckboxChange(event: Event, form: FormGroup, key: string, index: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    console.log('[PermissionMatrix] checkbox change:', {
      key,
      index,
      label: this.permissionOptions[index]?.label,
      checked,
      isMaster: index === 0,
      readonly: this.readonly()
    });

    if (this.readonly()) return;
    if (index !== 0) return; // Sadece ilk (master) checkbox digerlerini etkiler

    const masterChecked = (event.target as HTMLInputElement).checked;
    const group = form.controls[key] as FormGroup;
    if (!group) return;

    console.log('[PermissionMatrix] master toggled ->', masterChecked ? 'ENABLE others' : 'DISABLE + clear others', '| grup:', key);

    this.permissionOptions.slice(1).forEach(o => {
      const control = group.controls[o.label];
      if (!control) return;
      if (masterChecked) {
        control.enable({ emitEvent: false });
      } else {
        control.setValue(false, { emitEvent: false });
        control.disable({ emitEvent: false });
      }
    });

    // "Tumunu Sec" checked/indeterminate durumunu guncelle
    this.refreshSnapshots();
  }

  private fetchAndFillPermissions(id: string, fetchFn: (id: string) => Observable<Result<any>>): void {
    this.blockUi.block();
    fetchFn(id).subscribe({
      next: (res) => {
        this.blockUi.unblock();
        if (res.isSuccess && res.value) {
          this.loadPermissionsToForm(res.value.pagePermissionList || []);
        } else {
          this.clearAllPermissions(true);
        }
      },
      error: () => {
        this.blockUi.unblock();
        this.clearAllPermissions(true);
      }
    });
  }

  private loadPermissionsToForm(permissionList: any[]): void {
    // Önce formu temizle ve enable/disable çakışmasını önle
    this.matrixForm.enable({ emitEvent: false });
    this.moduleForm.enable({ emitEvent: false });

    const pagePatch: { [key: string]: any } = {};
    const groupPatch: { [key: string]: any } = {};

    permissionList.forEach(item => {
      if (item.pageName && this.matrixForm.contains(item.pageName)) {
        pagePatch[item.pageName] = this.bitsToControls(item.permissionValue);
      } else if (item.groupKey && this.moduleForm.contains(item.groupKey)) {
        groupPatch[item.groupKey] = this.bitsToControls(item.permissionValue);
      }
    });

    this.matrixForm.patchValue(pagePatch);
    this.moduleForm.patchValue(groupPatch);

    // Veriler yazıldıktan sonra readonly + View bağımlılık durumunu tekrar uygula
    this.applyReadonlyState(this.readonly());
  }

  private bitsToControls(permissionValue: number): { [label: string]: boolean } {
    const values: { [label: string]: boolean } = {};
    this.permissionOptions.forEach(opt => {
      values[opt.label] = (permissionValue & opt.value) === opt.value;
    });
    return values;
  }

  // Değerleri okurken disabled olan form control'lerden de ham değer almak için getRawValue kullanıyoruz
  isChecked(form: FormGroup, groupKey: string, label: string): boolean {
    if (!form) return false;
    const group = form.controls[groupKey] as FormGroup;
    if (!group) return false;
    const rawValues = group.getRawValue();
    return !!rawValues[label];
  }

  // --- "Tumunu Sec" durum yansitmasi ---------------------------------------

  // Satirdaki TUM izinler secili mi? (checked)
  isRowAllChecked(scope: 'page' | 'module', key: string): boolean {
    const snap = scope === 'page' ? this.matrixSnapshot() : this.moduleSnapshot();
    const row = snap[key];
    if (!row) return false;
    return this.permissionOptions.every(opt => !!row[opt.label]);
  }

  // Bazilari secili, bazilari degilse (indeterminate)
  isRowIndeterminate(scope: 'page' | 'module', key: string): boolean {
    const snap = scope === 'page' ? this.matrixSnapshot() : this.moduleSnapshot();
    const row = snap[key];
    if (!row) return false;
    const checked = this.permissionOptions.filter(opt => !!row[opt.label]).length;
    return checked > 0 && checked < this.permissionOptions.length;
  }

  private controlsToBits(group: any): number {
    let value = 0;
    if (group) {
      this.permissionOptions.forEach(opt => {
        if (group[opt.label]) value |= opt.value;
      });
    }
    return value;
  }

  private emitPagePermissions(): void {
    const values = this.matrixForm.getRawValue();
    const list = this.pages().map(page => ({
      pageName: page.pageKey,
      permissionValue: this.controlsToBits(values[page.pageKey])
    }));
    this.permissionsChange.emit(list);
  }

  private emitGroupPermissions(): void {
    const values = this.moduleForm.getRawValue();
    const list = this.modules().map(m => ({
      groupKey: m.key,
      permissionValue: this.controlsToBits(values[m.key])
    }));
    this.groupPermissionsChange.emit(list);
  }

  toggleAllInPage(pageKey: string, event: Event): void {
    this.toggleAllInGroup(this.matrixForm, pageKey, event);
  }

  toggleAllInModule(groupKey: string, event: Event): void {
    this.toggleAllInGroup(this.moduleForm, groupKey, event);
  }

  private toggleAllInGroup(form: FormGroup, key: string, event: Event): void {
    if (this.readonly()) return;
    const isChecked = (event.target as HTMLInputElement).checked;
    const group = form.controls[key] as FormGroup;
    if (!group) return;

    // View'i once acmamiz gerekiyor ki digerleri enable olsun. patchValue objesi
    // View ile basladigi icin (permissionOptions siralamasi) sync dogru tetiklenir.
    const patch: { [label: string]: boolean } = {};
    this.permissionOptions.forEach(opt => patch[opt.label] = isChecked);
    group.patchValue(patch);

    this.refreshSnapshots();
  }

  selectAllPermissions(): void {
    if (this.readonly()) return;
    const allTrue = () => {
      const v: { [label: string]: boolean } = {};
      this.permissionOptions.forEach(opt => v[opt.label] = true);
      return v;
    };
    const pagePatch: { [key: string]: any } = {};
    this.filteredPages().forEach(p => pagePatch[p.pageKey] = allTrue());
    this.matrixForm.patchValue(pagePatch);

    const groupPatch: { [key: string]: any } = {};
    this.filteredModules().forEach(m => groupPatch[m.key] = allTrue());
    this.moduleForm.patchValue(groupPatch);

    this.refreshSnapshots();
  }

  clearAllPermissions(emitEvent = true): void {
    const allFalse = () => {
      const v: { [label: string]: boolean } = {};
      this.permissionOptions.forEach(opt => v[opt.label] = false);
      return v;
    };
    const pagePatch: { [key: string]: any } = {};
    this.filteredPages().forEach(p => pagePatch[p.pageKey] = allFalse());
    this.matrixForm.patchValue(pagePatch, { emitEvent });

    const groupPatch: { [key: string]: any } = {};
    this.filteredModules().forEach(m => groupPatch[m.key] = allFalse());
    this.moduleForm.patchValue(groupPatch, { emitEvent });
    this.applyReadonlyState(this.readonly());
  }
}
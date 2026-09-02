import { Component, input, output, inject, signal, computed, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageCatalogService } from '../../../core/services/page-catalog.service';
import { PageCatalogItemDto } from '../../../core/models/page-catalog-item.model';
import { PERMISSION_OPTIONS, PagePermissions } from '../../../core/constants/permissions.constant';
import { Result } from '../../models/results/result.model';
import { FormCancelButtonComponent } from '../form/form-cancel-button/form-cancel-button';
import { MultiSelectComponent } from '../multi-select/multi-select';

type WizardMode = 'module' | 'page';
type WizardStep = 'targets' | 'select' | 'perms';
type PermItem = { pageName?: string; groupKey?: string; permissionValue: number };

@Component({
  selector: 'app-permission-wizard',
  standalone: true,
  imports: [TranslatePipe, FormCancelButtonComponent, MultiSelectComponent],
  templateUrl: './permission-wizard.html',
  host: { 'class': 'block w-full' }
})
export class PermissionWizardComponent implements OnInit {
  private catalogService = inject(PageCatalogService);
  private translateService = inject(TranslateService);

  // Tekli hedef (liste sayfasından gelen mevcut akış). VERİLMEZSE çoklu seçim modu.
  targetId = input<string | null>(null);
  cancelUrl = input<string>('');

  // Tekli akışta mevcut yetkileri çekip merge etmek için (opsiyonel; çoklu modda kullanılmaz)
  fetchPermissions = input<((id: string) => Observable<Result<any>>) | null>(null);

  // savePermissions tek istek atar → tek Result döner (tekli akış da tek elemanlı dizi gönderir)
  savePermissions = input.required<(ids: string[], permissions: PermItem[], scope: number) => Observable<Result<any>>>();
  // ÇOKLU hedef seçimi için (yalnızca targetId yokken kullanılır) — app-multi-select'i besler
  fetchTargets = input<(() => Observable<Result<any[]>>) | null>(null);
  targetLabelFn = input<(item: any) => string>((x: any) => x?.fullName ?? x?.name ?? String(x?.id));
  targetStepLabel = input<string>('Title.Wizard.SelectTargets');

  saved = output<void>();
  onCancel = output<void>();

  readonly VIEW = PagePermissions.View;   // = 1
  permissionOptions = PERMISSION_OPTIONS;

  step = signal<WizardStep>('select');
  mode = signal<WizardMode>('module');
  pages = signal<PageCatalogItemDto[]>([]);
  selectedGroupKeys = signal<Set<string>>(new Set());   // modül modu
  selectedPageKeys = signal<Set<string>>(new Set());    // sayfa modu
  selectedTargetIds = signal<string[]>([]);             // çoklu hedef modu
  permissionValue = signal<number>(0);
  isSaving = signal(false);

  // targetId yoksa çoklu mod
  isBulkMode = computed(() => !this.targetId());

  groups = computed(() => {
    const map = new Map<string, PageCatalogItemDto[]>();
    for (const p of this.pages()) {
      const g = p.groupKey ?? '__none__';
      (map.get(g) ?? map.set(g, []).get(g)!).push(p);
    }
    return Array.from(map.entries()).map(([key, pages]) => ({ key, pages }));
  });

  constructor() {
    this.catalogService.getSystemModules().subscribe(res => {
      if (res.isSuccess && res.value) this.pages.set(res.value);
    });
  }

  ngOnInit(): void {
    // Tekli hedef geldiyse hedef seçim adımını ATLA
    this.step.set(this.isBulkMode() ? 'targets' : 'select');
  }

  t(key: string) { return this.translateService.instant(key); }

  onTargetsChange(ids: string[]) { this.selectedTargetIds.set(ids); }

  setMode(m: WizardMode) {
    this.mode.set(m);
    this.selectedPageKeys.set(new Set());
  }

  isPageSelected(pageKey: string) { return this.selectedPageKeys().has(pageKey); }
  togglePage(pageKey: string) {
    const s = new Set(this.selectedPageKeys());
    s.has(pageKey) ? s.delete(pageKey) : s.add(pageKey);
    this.selectedPageKeys.set(s);
  }

  isGroupSelected(k: string) { return this.selectedGroupKeys().has(k); }
  toggleGroup(k: string) {
    const s = new Set(this.selectedGroupKeys());
    s.has(k) ? s.delete(k) : s.add(k);
    this.selectedGroupKeys.set(s);
  }

  canProceedTargets = computed(() => this.selectedTargetIds().length > 0);
  canProceedSelect = computed(() =>
    this.mode() === 'module' ? this.selectedGroupKeys().size > 0 : this.selectedPageKeys().size > 0);

  goNext() {
    if (this.step() === 'targets') { if (this.canProceedTargets()) this.step.set('select'); return; }
    if (this.step() === 'select') { if (this.canProceedSelect()) this.step.set('perms'); return; }
  }
  goBack() {
    if (this.step() === 'perms') { this.step.set('select'); return; }
    if (this.step() === 'select' && this.isBulkMode()) { this.step.set('targets'); return; }
  }

  handleCancel() { this.onCancel.emit(); }

  isPermChecked(value: number) { return (this.permissionValue() & value) === value; }
  togglePerm(value: number) {
    let v = this.permissionValue();
    v = (v & value) === value ? v & ~value : v | value;
    if (value === this.VIEW && (v & this.VIEW) === 0) v = 0;
    if (value !== this.VIEW && (this.permissionValue() & this.VIEW) === 0) return;
    this.permissionValue.set(v);
  }

  canSave = computed(() => this.permissionValue() > 0);

  private resolveTargetIds(): string[] {
    const single = this.targetId();
    return single ? [single] : this.selectedTargetIds();
  }

  save() {
    if (!this.canSave() || this.isSaving()) return;
    const ids = this.resolveTargetIds();
    if (ids.length === 0) return;

    this.isSaving.set(true);
    const isGroup = this.mode() === 'module';
    const scope = isGroup ? 2 : 1;

    const single = this.targetId();
    const fetchFn = this.fetchPermissions();

    // TEKLİ akış + fetchPermissions verildiyse: mevcut yapı korunur (mevcut yetkileri çek + merge)
    if (single && fetchFn) {
      fetchFn(single).subscribe({
        next: (res) => this.commitMerged(single, isGroup, scope, res?.value?.pagePermissionList ?? []),
        error: () => this.commitMerged(single, isGroup, scope, [])
      });
      return;
    }

    // ÇOKLU (veya fetchPermissions yok): yalnızca seçilenleri tüm hedeflere gönder (targeted backend)
    this.commit(ids, this.buildSelectedPermissions(isGroup), scope);
  }

  private buildSelectedPermissions(isGroup: boolean): PermItem[] {
    const selected = isGroup ? this.selectedGroupKeys() : this.selectedPageKeys();
    const value = this.permissionValue();
    return Array.from(selected).map(k =>
      isGroup ? { groupKey: k, permissionValue: value } : { pageName: k, permissionValue: value });
  }

  private commitMerged(id: string, isGroup: boolean, scope: number, existing: any[]) {
    const map = new Map<string, number>();
    for (const it of existing) {
      const key = isGroup ? it.groupKey : it.pageName;
      if (key) map.set(key, it.permissionValue);
    }
    const selected = isGroup ? this.selectedGroupKeys() : this.selectedPageKeys();
    for (const k of selected) map.set(k, this.permissionValue());

    const permissions = Array.from(map.entries())
      .filter(([, v]) => v > 0)
      .map(([k, permissionValue]) =>
        isGroup ? { groupKey: k, permissionValue } : { pageName: k, permissionValue });

    this.commit([id], permissions, scope);
  }

  private commit(ids: string[], permissions: PermItem[], scope: number) {
    this.savePermissions()(ids, permissions, scope).subscribe({
      next: () => { this.isSaving.set(false); this.saved.emit(); },
      error: () => this.isSaving.set(false)
    });
  }
}
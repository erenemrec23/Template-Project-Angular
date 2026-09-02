import { Component, OnInit, input, output, inject, signal, computed, effect } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Result } from '../../models/results/result.model';

/**
 * Genel amacli, aranabilir cok-secimli checkbox listesi.
 *
 * Hedef-agnostik: lookup (tum kayitlar) ve atanmis-id fonksiyonlari disaridan verilir.
 * - role-form  : rolleri kullaniciya (personel) atarken
 * - user-form  : kullaniciyi rollere atarken
 * gibi tum ata/coz senaryolarinda tek componentle kullanilir.
 *
 * NOT: fetchAll / fetchAssigned STABIL referans olmali (component alaninda tanimlayin,
 * template'te inline arrow ile VERMEYIN) — aksi halde her CD dongusunde yeniden fetch tetiklenir.
 */
@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [],
  templateUrl: './multi-select.html',
  host: { class: 'block w-full' }
})
export class MultiSelectComponent implements OnInit {
  private translateService = inject(TranslateService);

  // Hedef entity id'si (ör. userId / roleId). Create modunda null olabilir.
  targetId = input<string | null>(null);

  // Tum secilebilir kayitlar (lookup)
  fetchAll = input.required<() => Observable<Result<any[]>>>();

  // Hedefe atanmis id listesi (opsiyonel; create modunda verilmez)
  fetchAssigned = input<((id: string) => Observable<Result<string[]>>) | null>(null);

  // Etiket ve id cikarici fonksiyonlar (varsayilan {id, name} sekli)
  labelFn = input<(item: any) => string>((item) => item?.name ?? '');
  idFn = input<(item: any) => string>((item) => item?.id);

  // Salt-okunur (goruntuleme) modu — true ise secim degistirilemez
  readonly = input<boolean>(false);

  // i18n anahtarlari
  searchPlaceholder = input<string>('Placeholder.Search');
  emptyText = input<string>('Label.NoRecords');
  selectedText = input<string>('Label.Selected');

  selectionChange = output<string[]>();

  private items = signal<any[]>([]);
  private selectedIds = signal<Set<string>>(new Set<string>());
  search = signal<string>('');

  filtered = computed(() => {
    const label = this.labelFn();
    const term = this.search().trim().toLocaleLowerCase();
    const list = this.items();
    if (!term) return list;
    return list.filter(i => (label(i) ?? '').toLocaleLowerCase().includes(term));
  });

  selectedCount = computed(() => this.selectedIds().size);

  constructor() {
    // targetId geldiginde/degistiginde atanmis id'leri yeniden seed'le (edit modu).
    effect(() => {
      const id = this.targetId();
      const fetchAssigned = this.fetchAssigned();
      if (id && fetchAssigned) {
        fetchAssigned(id).subscribe({
          next: (res) => {
            if (res?.isSuccess && res.value) {
              this.selectedIds.set(new Set(res.value));
              this.emit();
            }
          }
        });
      }
    });
  }

  ngOnInit(): void {
    // Lookup'i bir kez yukle.
    const fetch = this.fetchAll();
    fetch().subscribe({
      next: (res) => {
        if (res?.isSuccess && res.value) this.items.set(res.value);
      }
    });
  }

  t(key: string): string { return this.translateService.instant(key); }

  getId(item: any): string { return this.idFn()(item); }
  getLabel(item: any): string { return this.labelFn()(item); }

  isSelected(id: string): boolean { return this.selectedIds().has(id); }

  toggle(id: string): void {
    if (this.readonly()) return;
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
    this.emit();
  }

  onSearch(value: string): void { this.search.set(value); }

  private emit(): void {
    this.selectionChange.emit(Array.from(this.selectedIds()));
  }
}
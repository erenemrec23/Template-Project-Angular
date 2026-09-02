import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TableToolbarComponent } from '../../shared/components/table/table-toolbar/table-toolbar';
import { TableComponent } from '../../shared/components/table/table/table';
import { TableCellHeaderComponent } from '../../shared/components/table/table-cell-header/table-cell-header';
import { TableCellTextComponent } from '../../shared/components/table/table-cell-text/table-cell-text';
import { TableEmptyStateComponent } from '../../shared/components/table/table-empty-state/table-empty-state';
import { PermissionReportService } from './permission-report.service';
import {
  PAGE_ACCESS_FLAGS, PermissionReportFilter, PermissionReportItem,
  PermissionReportLookup, PermissionSourceInfo,
} from './permission-report.models';
import { TooltipDirective } from "../../shared/directives/tooltip.directive";
import { SelectComponent } from '../../shared/components/user-select/select';
import { SelectItem } from '../../shared/components/user-select/select-item.model';

type SortField = 'ownerName' | 'menuGroupKey' | 'key' | 'permissionValue';

@Component({
  selector: 'app-permission-report',
  standalone: true,
  imports: [
    FormsModule, TranslatePipe,
    TableToolbarComponent, TableComponent, TableCellHeaderComponent,
    TableCellTextComponent, TableEmptyStateComponent,
    TooltipDirective,SelectComponent
],
  templateUrl: './permission-report.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionReportComponent implements OnInit {
 
// imports dizisine SelectComponent ekle

// --- Select kaynakları (label'lar önceden çevrilir; app-select çeviri yapmaz) ---
readonly ownerTypeItems = computed<SelectItem[]>(() => [
  { id: 1, name: this.translate.instant('Label.User') },
  { id: 2, name: this.translate.instant('Label.Role') },
]);

readonly userItems = computed<SelectItem[]>(() => this.lookups()?.users ?? []);
readonly roleItems = computed<SelectItem[]>(() => this.lookups()?.roles ?? []);

readonly menuGroupItems = computed<SelectItem[]>(() =>
  (this.lookups()?.menuGroups ?? []).map(g => ({
    id: g.id,
    name: this.translate.instant(`MenuGroup.${g.name}`),
  })),
);

readonly pageItems = computed<SelectItem[]>(() =>
  this.pageOptions().map(p => ({
    id: p.pageId,
    name: this.translate.instant(`PageTitle.${p.key}`),
  })),
);

readonly flagItems = computed<SelectItem[]>(() =>
  this.flags.map(f => ({ id: f.value, name: this.translate.instant(f.label) })),
);
  private readonly service = inject(PermissionReportService);
  private readonly translate = inject(TranslateService);

  readonly flags = PAGE_ACCESS_FLAGS;
  readonly loading = signal(false);
  readonly exporting = signal(false);
  readonly lookups = signal<PermissionReportLookup | null>(null);
  readonly rows = signal<PermissionReportItem[]>([]);
  readonly filter = signal<PermissionReportFilter>({ onlyGranted: true });

  readonly sortField = signal<SortField>('ownerName');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly pageOptions = computed(() => {
    const pages = this.lookups()?.pages ?? [];
    const gid = this.filter().menuGroupId;
    return gid ? pages.filter(p => p.menuGroupId === gid) : pages;
  });

  /** Client-side sıralama. Sahip sırası korunur; sahip içinde seçili alana göre sıralanır. */
  readonly sortedRows = computed(() => {
    const field = this.sortField();
    const dir = this.sortOrder() === 'asc' ? 1 : -1;
    const t = (k: string) => this.translate.instant(k);

    const val = (r: PermissionReportItem): string | number => {
      switch (field) {
        case 'menuGroupKey': return r.menuGroupKey ? t(`MenuGroup.${r.menuGroupKey}`) : '';
        case 'key':          return t(`PageTitle.${r.key}`);
        case 'permissionValue': return r.permissionValue;
        default:             return r.ownerName;
      }
    };

    return [...this.rows()].sort((a, b) => {
      // Sahip her zaman birincil anahtar (rowspan gruplaması bozulmasın)
      const owner = a.ownerType - b.ownerType || a.ownerName.localeCompare(b.ownerName, 'tr');
      if (field === 'ownerName') return owner * dir;
      if (owner !== 0) return owner;
      const x = val(a), y = val(b);
      return (typeof x === 'number' && typeof y === 'number'
        ? x - y
        : String(x).localeCompare(String(y), 'tr')) * dir;
    });
  });

  readonly grouped = computed(() => {
    const map = new Map<string, PermissionReportItem[]>();
    for (const r of this.sortedRows()) {
      const key = `${r.ownerType}:${r.ownerId}`;
      let bucket = map.get(key);
      if (!bucket) map.set(key, (bucket = []));
      bucket.push(r);
    }
    return [...map.values()];
  });

  readonly summary = computed(() => ({ owners: this.grouped().length, rows: this.rows().length }));

  ngOnInit(): void {
    this.service.getLookups().subscribe(r => { if (r.isSuccess) this.lookups.set(r.value); });
    this.load();
  }

  toggleSort(field: string): void {
    const f = field as SortField;
    if (this.sortField() === f) this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    else { this.sortField.set(f); this.sortOrder.set('asc'); }
  }

  onFilterChange(key: keyof PermissionReportFilter, raw: unknown): void {
    const value = this.coerce(key, raw);
    this.filter.update(f => ({ ...f, [key]: value, ...(key === 'menuGroupId' ? { pageId: undefined } : {}) }));
  }

  private coerce(key: keyof PermissionReportFilter, raw: unknown): unknown {
    if (key === 'onlyGranted') return !!raw;
    if (raw === '' || raw === null || raw === undefined) return undefined;
    switch (key) {
      case 'ownerType': case 'menuGroupId': case 'pageId': case 'hasFlag': return Number(raw);
      default: return String(raw);
    }
  }

  load(): void {
    this.loading.set(true);
    this.service.getReport(this.filter()).subscribe({
      next: r => { if (r.isSuccess) this.rows.set(r.value); },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  reset(): void { this.filter.set({ onlyGranted: true }); this.load(); }

  exportExcel(): void {
    this.exporting.set(true);
    this.service.exportExcel(this.filter()).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'YetkiRaporu.xlsx'; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.exporting.set(false),
      complete: () => this.exporting.set(false),
    });
  }

  ownerLabel(t: number): string { return t === 1 ? 'Label.User' : 'Label.Role'; }

  sourceLabel(s: PermissionSourceInfo): string {
    const t = (k: string) => this.translate.instant(k);
    const group = s.menuGroupKey ? t(`MenuGroup.${s.menuGroupKey}`) : '';
    switch (s.kind) {
      case 'Direct':    return t('Label.SourceDirect');
      case 'Group':     return `${t('Label.SourceGroup')}: ${group}`;
      case 'Role':      return `${t('Label.SourceRole')}: ${s.roleName ?? ''}`;
      case 'RoleGroup': return `${t('Label.SourceRoleGroup')}: ${s.roleName ?? ''}/${group}`;
      default:          return s.kind;
    }
  }

  sourcesText(r: PermissionReportItem): string {
    return r.sources.map(s => this.sourceLabel(s)).join(', ');
  }
}
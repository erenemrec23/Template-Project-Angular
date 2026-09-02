import { Directive, OnInit, signal, effect, inject, computed } from '@angular/core';
import { Subject, filter } from 'rxjs';
import { debounceTime, last } from 'rxjs/operators';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PagePermissionService, PagePerms } from '../services/page-permission.service';
import { FileDownloadService } from '../services/file-download.service';
import { ToastService } from '../components/toast/toast.service';
import { PageRequestBaseDto } from '../models/paginate/paginate.model';
import { BaseFilterState, FilterFieldConfig, IListService } from '../models/list-config.model';
import { toQueryParams, mergeQueryParamsWithDefaults } from '../utils/query-params.util';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfirmService } from '../components/confirm/services/confirm.service';
import { BlockUiService } from '../../core/services/block-ui.service';
import { ExcelCoreService } from '../services/excel-core.service'
import { ExcelColumnConfig } from '../components/excel-import-modal/excel-import-modal';
@Directive()
export abstract class BaseListDirective<TEntity, TFilterState extends BaseFilterState> implements OnInit {
  // ... diğer inject'ler
  protected excelCoreService = inject(ExcelCoreService);
  protected fileDownloadService = inject(FileDownloadService);

  // ── Entity'ye özel config: alt sınıf doldurur ──
  protected abstract service: IListService<TEntity>;
  protected globalSearchFields: string[] = [];
  protected filterFieldConfigs: FilterFieldConfig[] = [];
  protected exportFileName = 'Export';

  protected excelColumns: ExcelColumnConfig[] = [];

  private blockUi = inject(BlockUiService);
  private confirmService = inject(ConfirmService);
  private permissionService = inject(PagePermissionService);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected translate = inject(TranslateService);
  protected toast = inject(ToastService);
  protected perms!: PagePerms;


  items = signal<TEntity[]>([]);
  isLoading = signal<boolean>(false);
  isExporting = signal<boolean>(false);
  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);
  totalCount = signal<number>(0);
  totalPages = signal<number>(0);
  hasNext = signal<boolean>(false);
  hasPrevious = signal<boolean>(false);

  filters = signal<TFilterState>({} as TFilterState);
  private initialFilters!: TFilterState;

  // ── Aktif / Silinen tab durumu ──
  showPassived = signal<boolean>(false);

  // YENİ: pageIndex/pageSize için gerçek default değerler (URL karşılaştırmasında kullanılacak)
  private readonly defaultPageIndex = 0;
  private readonly defaultPageSize = 10;

  // YENİ: açılışta ilk URL senkronizasyonunu atlamak için (gereksiz ekstra navigate'i önler)
  private urlSyncEnabled = false;

  protected filterInputChange$ = new Subject<void>();

  constructor() {
    effect(() => {
      this.pageIndex();
      this.pageSize();
      this.filters();
      this.showPassived();
      this.loadData();
    }, { allowSignalWrites: true });

    // YENİ: filtre/sayfalama her değiştiğinde URL'i güncelle
    effect(() => {
      const currentFilters = this.filters();
      const currentPageIndex = this.pageIndex();
      const currentPageSize = this.pageSize();

      if (!this.urlSyncEnabled) return; // setInitialFilters çağrılana kadar bekle

      const combined: any = {
        ...currentFilters,
        pageIndex: currentPageIndex,
        pageSize: currentPageSize,
      };

      const defaults: any = {
        ...this.initialFilters,
        pageIndex: this.defaultPageIndex,
        pageSize: this.defaultPageSize,
      };

      const queryParams = toQueryParams(combined, defaults);

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        replaceUrl: true,
        queryParamsHandling: '', // eski query params'ı tamamen değiştir, silinen filtreler URL'den de kalksın
      });
    }, { allowSignalWrites: true });
  }

  t(key: string): string {
    return this.translate.instant(key);
  }

  ngOnInit(): void {
    this.perms = this.permissionService.getPermissions(this.route);
    if (!this.perms.view) {
      this.router.navigate(['/'], {
        state: { toast: { type: 'error', message: this.t('Messages.NoViewPermission') || 'Bu sayfayı görüntüleme yetkiniz yok.' } }
      });
      return;
    }

    this.filterInputChange$.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.filters.set({ ...this.filters() });
    });
  }

  protected setInitialFilters(defaultFilters: TFilterState): void {
    // "Filtreleri Temizle" tıklandığında dönülecek gerçek default (URL'den etkilenmez)
    this.initialFilters = { ...defaultFilters };

    // YENİ: URL'deki query params varsa defaults ile merge et
    const queryParams = this.route.snapshot.queryParams;
    const mergedFilters = mergeQueryParamsWithDefaults(queryParams, defaultFilters);
    this.filters.set(mergedFilters);

    // YENİ: pageIndex/pageSize de URL'den okunuyorsa uygula
    if (queryParams['pageIndex'] !== undefined) {
      const p = Number(queryParams['pageIndex']);
      if (!isNaN(p)) this.pageIndex.set(p);
    }
    if (queryParams['pageSize'] !== undefined) {
      const s = Number(queryParams['pageSize']);
      if (!isNaN(s)) this.pageSize.set(s);
    }

    // YENİ: artık URL senkronizasyonu aktif olsun (bundan sonraki her değişiklik URL'e yazılır)
    this.urlSyncEnabled = true;
  }

  onInputChange(): void {
    this.pageIndex.set(0);
    this.filterInputChange$.next();
  }

  // ── Aktif / Silinen tab geçişi ──
  toggleDeletedView(value: boolean): void {
    if (this.showPassived() === value) return;
    this.showPassived.set(value);
    this.pageIndex.set(0);
    this.selectedIds.set(new Set());
  }

  toggleSort(field: string): void {
    const current: any = this.filters();
    let newOrder: 'asc' | 'desc' | '' = 'asc';

    if (current.sortField === field) {
      newOrder = current.sortOrder === 'asc'
        ? 'desc'
        : current.sortOrder === 'desc' ? '' : 'asc';
    }

    this.pageIndex.set(0);
    this.filters.update(f => ({
      ...f,
      sortField: newOrder === '' ? '' : field,
      sortOrder: newOrder
    }));
  }

  clearFilters(): void {
    this.pageIndex.set(0);
    this.pageSize.set(this.defaultPageSize);
    if (this.initialFilters) {
      this.filters.set({ ...this.initialFilters });
    }
  }


  onPageChange(newIndex: number): void {
    this.pageIndex.set(newIndex);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.pageIndex.set(0);
  }

  protected resetTableState(): void {
    this.items.set([]);
    this.totalCount.set(0);
    this.totalPages.set(0);
    this.hasNext.set(false);
    this.hasPrevious.set(false);
  }

  // ── Genel filter/sort builder ──
  protected buildBackendFilters(): any {
    const current: any = this.filters();

    const active = this.filterFieldConfigs
      .map(cfg => {
        const condition = cfg.conditionKey ? current[cfg.conditionKey] : (cfg.defaultCondition ?? 'contains');
        const operator = String(condition).toLowerCase();

        // isempty/isnotempty koşulunda değer gerekmez; diğer koşullarda value boşsa
        // filtre hiç gönderilmez (table-cell-header'daki hasActiveFilter mantığıyla tutarlı)
        const isValuelessOperator = operator === 'isempty' || operator === 'isnotempty';

        const value = current[cfg.valueKey];
        const hasValue = value !== undefined && value !== null && value !== '';

        if (!isValuelessOperator && !hasValue) return null;

        const filter: any = { field: cfg.field, operator };
        if (!isValuelessOperator) {
          filter.value = value;
        }

        if (cfg.value2Key && !isValuelessOperator) {
          const value2 = current[cfg.value2Key];
          const hasValue2 = value2 !== undefined && value2 !== null && value2 !== '';

          if (operator === 'between') {
            // Aralık filtresi: bitiş değeri henüz girilmediyse bu filtreyi hiç gönderme
            if (!hasValue2) return null;
            filter.value2 = value2;
          } else if (hasValue2) {
            filter.value2 = value2;
          }
        }

        return filter;
      })
      .filter(f => f !== null);

    if (active.length === 0) return null;
    if (active.length === 1) return active[0];
    return { logic: 'and', filters: active };
  }

  protected buildBackendSorts(): any {
    const current = this.filters();
    if (!current.sortField || !current.sortOrder) return null;
    return [{ field: current.sortField, dir: current.sortOrder }];
  }

  protected buildGlobalSearch(): any {
    const current: any = this.filters();
    return current.globalSearch && this.globalSearchFields.length
      ? { fields: this.globalSearchFields, value: current.globalSearch }
      : null;
  }

  // ── Ortak veri yükleme ──
  loadData(): void {
    this.blockUi.block();
    this.isLoading.set(true);

    const request: PageRequestBaseDto = {
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      dynamicFilterAndSort: {
        filter: this.buildBackendFilters(),
        sort: this.buildBackendSorts()
      },
      globalSearch: this.buildGlobalSearch()
    } as PageRequestBaseDto;
    const fetch$ = (this.showPassived() && this.service.getPassivedList)
      ? this.service.getPassivedList(request)
      : this.service.getList(request);

    fetch$.subscribe({
      next: (response) => {

        this.blockUi.unblock();
        if (response?.isSuccess && response.value) {
          this.items.set(response.value.items);
          this.totalCount.set(response.value.totalFilteredItemCount);
          this.totalPages.set(response.value.totalPages);
          this.hasNext.set(response.value.hasNext);
          this.hasPrevious.set(response.value.hasPrevious);
        } else {
          this.resetTableState();
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.blockUi.unblock();
        console.error('Veri yüklenirken hata oluştu:', err);
        this.resetTableState();
        this.isLoading.set(false);
      }
    });
  }

  // ── Ortak silme ──
  async onDelete(id: string | number): Promise<void> {
    const isConfirmed = await this.confirmService.open();
    if (!isConfirmed) return;

    this.service.deleteById(id).subscribe({
      next: () => {
        this.toast.success(this.t('Messages.DeleteSuccess'));
        this.loadData();
      },
      error: (err) => {
        console.error('Silme işlemi başarısız:', err);
        this.toast.error(this.t('Messages.DeleteError'));
      }
    });
  }

  // ── Ortak geri yükleme ──
  async onSetActive(id: string | number): Promise<void> {
    const isConfirmed = await this.confirmService.open();
    if (!isConfirmed) return;

    if (!this.service.setActiveById) {
      console.warn('Enjekte edilen servis restoreById metodunu barındırmıyor.');
      return;
    }

    this.service.setActiveById(id).subscribe({
      next: () => {
        this.toast.success(this.t('Messages.RestoreSuccess'));
        this.loadData();
      },
      error: (err) => {
        console.error('Geri yükleme işlemi başarısız:', err);
        this.toast.error(this.t('Messages.RestoreError'));
      }
    });
  }

  // ── Ortak excel export ──
  downloadExportDataListExcel(): void {
    if (!this.service.exportList) return;

    this.isExporting.set(true);

    const request: PageRequestBaseDto = {
      dynamicFilterAndSort: this.buildBackendFilters() || this.buildBackendSorts()
        ? { filter: this.buildBackendFilters(), sort: this.buildBackendSorts() }
        : null,
      globalSearch: this.buildGlobalSearch(),
      pageIndex: 0,
      pageSize: 1000000,

    };

    this.service.exportList(request).subscribe({
      next: (blob: Blob) => {
        this.fileDownloadService.downloadExcel(blob, this.exportFileName);
        this.isExporting.set(false);
      },
      error: (err) => {
        console.error('Excel indirilirken bir hata oluştu:', err);
        this.isExporting.set(false);
      }
    });
  }

  downloadExportSampleDataListExcel(): void {
    

    this.service.exportSampleList().subscribe({
      next: (blob: Blob) => {
        this.fileDownloadService.downloadExcel(blob, this.exportFileName);
        this.isExporting.set(false);
      },
      error: (err) => {
        console.error('Excel indirilirken bir hata oluştu:', err);
        this.isExporting.set(false);
      }
    });
  }
  // ── Ortak bulk create yardımcı ──
  protected bulkCreateInternal<TBulk>(
    data: any[],
    mapItem: (item: any) => any,
    wrapDto: (mapped: any[]) => TBulk,
    onSuccess?: () => void,
    onError?: () => void,
    onFinally?: () => void 
  ): void {
    if (!this.service.bulkCreate) return;
    const dto = wrapDto(data.map(mapItem));
    this.service.bulkCreate(dto).subscribe({
      next: (response) => {
        if (response?.isSuccess) {
          this.toast.success(this.t('Messages.BulkCreateSuccess'));
          this.loadData();
          onSuccess?.();
          onFinally?.();
        } else {
          this.toast.error(this.t('Messages.BulkCreateErrorMessage'));
          onError?.();
          onFinally?.();
        }
      },
      error: () => {
        onError?.();
          onFinally?.();
      }
    });
  }


  private navigationEnd = toSignal(
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)),
    { initialValue: null }
  );

  private toPrefix(segment: string): string {
    const singular = segment.endsWith('s') ? segment.slice(0, -1) : segment;
    return singular.charAt(0).toUpperCase() + singular.slice(1); // 'role' -> 'Role'
  }
  titleKey = computed(() => {
    this.navigationEnd(); // dependency: her navigasyonda yeniden hesapla
    const path = this.router.url.split('?')[0];
    const segments = path.split('/').filter(Boolean); // ['roles', 'form', 'acac...']
    const prefix = this.toPrefix(segments[0]); // 'roles' -> 'Tenant' / 'Role'

    const hasId = this.route.snapshot.paramMap.has('id');
    const isFormRoute = path.includes('/form');

    if (isFormRoute && hasId) return `PageTitle.${prefix}.Form.Edit`;
    if (isFormRoute) return `PageTitle.${prefix}.Form.New`;
    return `PageTitle.${prefix}.List`;
  });

  // shared/directives/base-list.ts
  // ... Mevcut importlar ve kodlar

  // --- TOPLU SİLME STATE YÖNETİMİ ---
  selectedIds = signal<Set<string | number>>(new Set<string | number>());

  // Computed Bekçileri
  hasSelection = computed(() => this.selectedIds().size > 0);


  // Seçim Kutusu Aksiyonları
  toggleSelection(id: string | number): void {
    const updated = new Set(this.selectedIds());
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    this.selectedIds.set(updated);
  }

  toggleSelectAll(): void {
    const updated = new Set(this.selectedIds());
    this.items()
      .map(item => (item as any).id)
      .filter(id => !updated.has(id)) // Kümede yoksa filtreye takılsın
      .forEach(id => updated.add(id)); // Sadece eksik olanları kümeye ekle 
    this.selectedIds.set(updated);
  }
  resetPage(): void {
    this.pageIndex.set(this.defaultPageIndex);
    this.pageSize.set(this.defaultPageSize);
    this.showPassived.set(false);
    this.toggleClearAll();

    if (this.initialFilters) {
      this.filters.set({ ...this.initialFilters });
    }
  }
  // Örnek aldığımız onDelete yapısının kurumsal toplu versiyonu
  async onBulkDelete(): Promise<void> {
    if (!this.hasSelection()) return;

    const count = this.selectedIds().size;

    // Global onay (confirm) penceremizi özelleştirerek açıyoruz
    const isConfirmed = await this.confirmService.open();
    if (!isConfirmed) return;

    this.isLoading.set(true);
    const idsArray = Array.from(this.selectedIds()).map(id => String(id));

    // Servis üzerindeki toplu silme metodunu tetikliyoruz
    if ((this.service as any).bulkDeleteByIds) {
      (this.service as any).bulkDeleteByIds(idsArray).subscribe({
        next: () => {
          this.toast.success(this.t('Messages.DeleteSuccess'));
          this.selectedIds.set(new Set<string | number>()); // Seçimleri sıfırla
          this.loadData();
        },
        error: (err: any) => {
          console.error('Toplu silme işlemi başarısız:', err);
          this.toast.error(this.t('Messages.DeleteError'));
          this.isLoading.set(false);
        }
      });
    } else {
      console.warn('Enjekte edilen servis bulkDeleteByIds metodunu barındırmıyor.');
      this.isLoading.set(false);
    }
  }

  // Silinen tabındaki toplu geri yükleme
  async onBulkSetActive(): Promise<void> {
    if (!this.hasSelection()) return;

    const isConfirmed = await this.confirmService.open();
    if (!isConfirmed) return;

    this.isLoading.set(true);
    const idsArray = Array.from(this.selectedIds()).map(id => String(id));

    if ((this.service as any).bulkSetActiveByIds) {
      (this.service as any).bulkSetActiveByIds(idsArray).subscribe({
        next: () => {
          this.toast.success(this.t('Messages.SetActiveSuccess'));
          this.selectedIds.set(new Set<string | number>());
          this.loadData();
        },
        error: (err: any) => {
          console.error('Toplu geri yükleme işlemi başarısız:', err);
          this.toast.error(this.t('Messages.RestoreError'));
          this.isLoading.set(false);
        }
      });
    } else {
      console.warn('Enjekte edilen servis bulkSetActiveByIds metodunu barındırmıyor.');
      this.isLoading.set(false);
    }
  }
async onBulkSetPassive(): Promise<void> {
    if (!this.hasSelection()) return;

    const isConfirmed = await this.confirmService.open();
    if (!isConfirmed) return;

    this.isLoading.set(true);
    const idsArray = Array.from(this.selectedIds()).map(id => String(id));

    if ((this.service as any).bulkSetPassiveByIds) {
      (this.service as any).bulkSetPassiveByIds(idsArray).subscribe({
        next: () => {
          this.toast.success(this.t('Messages.PassiveSuccess'));
          this.selectedIds.set(new Set<string | number>());
          this.loadData();
        },
        error: (err: any) => {
          console.error('Toplu geri yükleme işlemi başarısız:', err);
          this.toast.error(this.t('Messages.RestoreError'));
          this.isLoading.set(false);
        }
      });
    } else {
      console.warn('Enjekte edilen servis bulkSetActiveByIds metodunu barındırmıyor.');
      this.isLoading.set(false);
    }
  }
  toggleClearAll(): void {
    //const updated = new Set(this.selectedIds()); 

    //this.items()
    //  .map(item => (item as any).id)
    //   .filter(id => updated.has(id)) // Sadece kümede halihazırda VAR OLANLARI filtrele
    //   .forEach(id => updated.delete(id)); // Kümede olan bu ID'leri tek tek sil (temizle)

    // this.selectedIds.set(updat)ed);
    this.selectedIds.set(new Set());
  }

  downloadSampleExcel(customFileName?: string, sampleCount: number = 3): void {
    if (!this.excelColumns || this.excelColumns.length === 0) {
      console.warn('Excel kolon konfigürasyonu (excelColumns) bulunamadı.');
      return;
    }

    const sampleRows = Array.from({ length: sampleCount }, (_, i) => i + 1).map(index => {
      const row: Record<string, string> = {};
       
      this.excelColumns.forEach(col => {
        if (col.field == 'code') {
          row[col.headerKey] = "0"
        }
        else {
          row[col.headerKey] = `${this.t(col.headerKey)} ${index}`;
        }
      });

      return row;
    });

    const fileName = customFileName || `${this.exportFileName}_Sample`;
      var headers = this.excelColumns.map(m=> ({ key:m.headerKey, 
                                              label:m.field }));
    this.excelCoreService.exportToExcel(sampleRows, fileName, 'DataTemplate', headers);
  }
}
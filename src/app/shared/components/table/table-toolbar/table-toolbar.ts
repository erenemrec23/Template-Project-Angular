// shared/components/table/table-toolbar/table-toolbar.ts

import { Component, inject, computed, signal, input, output } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // RouterLink EKLENDİ
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ToastService } from '../../toast/toast.service';
import { PagePermissionService } from '../../../services/page-permission.service';
import { SharedButtonComponent } from '../../button/button';
import { PageConfig, MenuGroupConfig } from '../../../../core/constants/pages';
import { MenuService } from '../../../../core/services/menu.service';
import { ToolbarAction } from './table-toolbar-action.model';

@Component({
  selector: 'app-table-toolbar',
  standalone: true,
  imports: [TranslatePipe, SharedButtonComponent, RouterLink], // RouterLink EKLENDİ
  host: { 'class': 'block w-full' },
  templateUrl: './table-toolbar.html'
})
export class TableToolbarComponent {
  private translate = inject(TranslateService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private permissions = inject(PagePermissionService);
  private router = inject(Router);
  private menuService = inject(MenuService);
  pageKeyInput = input<string>();
  groupKeyInput = input<string>();
  pages = signal<MenuGroupConfig[]>([]);
  resolvedPageKey = computed(() => this.pageKeyInput() || this.currentPage()?.key || '');
  resolvedGroupKey = computed(() => this.groupKeyInput() || this.currentPage()?.groupKey || '');
  constructor() {
    this.menuService.getMenu().subscribe(res => {
      if (res.isSuccess && res.value) this.pages.set(res.value);
    });
  }

  currentPage = computed<PageConfig | undefined>(() => {
    const currentUrl = this.router.url.split('?')[0];
    const allPages = this.pages().flatMap(group => 
    group.children.map(child => ({
      ...child,
      groupKey: group.key // Üst grubun (ör. "Admin") key değerini aktarıyoruz
    }))
  )
    return allPages.find(p => p.route === currentUrl) || allPages[0];
  });

  canAdd = computed(() => this.permissions.canInsert(this.route, this.showAddButton()));
  canImportExcel = computed(() => this.permissions.canImportExcel(this.route, this.showImportButton()));
  canExportExcel = computed(() => this.permissions.canExportExcel(this.route, this.canExport()));
  
  // YENİ: Sayfa Yetkilerini Yönetme Butonunun Yetki Kontrolü
  canManagePagePermissions = computed(() => this.permissions.canManagePagePermissions(this.route));

  title = input.required<string>();
  description = input<string>('');
  isLoading = input<boolean>(false);

  // YENİ: Dışarıdan verilebilecek veya menü kataloğundan otomatik çözülecek Key'ler
  pageKey = input<string>();
  groupKey = input<string>();

  showAddButton = input<boolean>(true);
  addButtonRouterLink = input<string | any[]>();

  showExportButton = input<boolean>(false);
  canExport = input<boolean>(true);

  showImportButton = input<boolean>(false);
  canImport = input<boolean>(true);

  // YENİ: Mevcut butonların SOLUNA eklenen ekstra aksiyon butonları (row-actions deseni)
  extraActions = input<ToolbarAction[]>([]);
  visibleExtraActions = computed(() =>
    this.extraActions().filter(a =>
      typeof a.visible === 'function' ? a.visible() : a.visible !== false)
  );

  refresh = output<void>();
  exportDataListExcel = output<void>();
  openImport = output<void>();

  isDragOver = signal<boolean>(false);

  t(key: string): string {
    return this.translate.instant(key);
  }

  onRefreshClick(): void { this.refresh.emit(); }

  onExtraActionClick(action: ToolbarAction): void {
    action.onClick?.();
  }

  onExportDataClick(): void {
    this.exportDataListExcel.emit();
    this.toast.success(this.translate.instant('Message.ExcelExported'));
  }

  openImportModal(): void { this.openImport.emit(); }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    if (this.showImportButton() && this.canImport()) this.openImport.emit();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.showImportButton() && this.canImport()) this.isDragOver.set(true);
  }

  onDragLeave(): void { this.isDragOver.set(false); }
}
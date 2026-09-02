import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PermissionMatrixComponent } from '../../../shared/components/permission-matrix/permission-matrix';
import { TableComponent } from '../../../shared/components/table/table/table';
import { TableCellTextComponent } from '../../../shared/components/table/table-cell-text/table-cell-text';
import { TablePaginationComponent } from '../../../shared/components/table/table-pagination/table-pagination';
import { TableCellHeaderComponent } from '../../../shared/components/table/table-cell-header/table-cell-header';
import { UserPermissionService } from '../../user-permissions/services/user-permission.service';
import { RoleService } from '../../roles/services/role.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PagePermissionManagementService, PermissionLookupRequest } from '../services/page-permission-management.service';
import { SharedButtonComponent } from '../../../shared/components/button/button';
import { TableCellHeaderActionsComponent } from '../../../shared/components/table/table-cell-header-actions/table-cell-header-actions'; 
enum PermissionFilter { All = 0, WithPermission = 1, WithoutPermission = 2 }

interface Paginate<T> {
  items: T[];
  index: number;
  pageSize: number;
  totalItemCount: number;
  totalFilteredItemCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface RoleLookupItem { id: string; name: string; hasPermission: boolean; }
interface UserLookupItem { id: string; name: string; hasPermission: boolean; }

@Component({
  selector: 'app-page-permission-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    PermissionMatrixComponent,
    TableComponent,
    TableCellTextComponent,
    TablePaginationComponent,
    TableCellHeaderComponent, 
    ModalComponent,
    SharedButtonComponent
  ],
  templateUrl: './page-permission-management.html'
})
export class PagePermissionManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private userPermissionService = inject(UserPermissionService);
  private roleService = inject(RoleService);
  private permissionManagementService = inject(PagePermissionManagementService);
  private location = inject(Location);

  readonly PermissionFilter = PermissionFilter;

  pageKey = signal<string>('');
  groupKey = signal<string>('');

  // ---- ROL tablosu state ----
  roles = signal<RoleLookupItem[]>([]);
  roleSearch = signal<string>('');
  roleFilter = signal<PermissionFilter>(PermissionFilter.All);
  rolePageIndex = signal<number>(0);
  rolePageSize = signal<number>(10);
  roleTotalPages = signal<number>(0);
  roleTotalCount = signal<number>(0);
  roleLoading = signal<boolean>(false);

  // Tenant listesindeki gibi sort state (Varsayılan: HasPermission desc)
  roleSortField = signal<string>('HasPermission');
  roleSortOrder = signal<'asc' | 'desc' | ''>('desc');

  // ---- KULLANICI tablosu state ----
  users = signal<UserLookupItem[]>([]);
  userSearch = signal<string>('');
  userFilter = signal<PermissionFilter>(PermissionFilter.All);
  userPageIndex = signal<number>(0);
  userPageSize = signal<number>(10);
  userTotalPages = signal<number>(0);
  userTotalCount = signal<number>(0);
  userLoading = signal<boolean>(false);

  // Tenant listesindeki gibi sort state (Varsayılan: HasPermission desc)
  userSortField = signal<string>('HasPermission');
  userSortOrder = signal<'asc' | 'desc' | ''>('desc');

  // ---- Düzenle modalı ----
  selectedTarget = signal<{ id: string; name: string; isRole: boolean } | null>(null);
  isModalOpen = signal<boolean>(false);
  saving = signal<boolean>(false);
  private modalPagePerms: any[] = [];
  private modalGroupPerms: any[] = [];

  private roleTimer: any;
  private userTimer: any;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.pageKey.set(params['pageKey'] || '');
      this.groupKey.set(params['groupKey'] || '');
      if (this.pageKey()) {
        this.loadRoles();
        this.loadUsers();
      }
    });
  }

  t(key: string): string { return this.translate.instant(key); }

  goBack(): void {
    this.location.back();
  }

  // ============ ROL SIRALAMA VE YÜKLEME ============
  toggleRoleSort(field: string): void {
    let newOrder: 'asc' | 'desc' | '' = 'asc';

    if (this.roleSortField() === field) {
      newOrder = this.roleSortOrder() === 'asc'
        ? 'desc'
        : this.roleSortOrder() === 'desc' ? '' : 'asc';
    }

    this.roleSortField.set(newOrder === '' ? '' : field);
    this.roleSortOrder.set(newOrder);
    this.rolePageIndex.set(0);
    this.loadRoles();
  }

  loadRoles(): void {
    if (!this.pageKey()) return;
    this.roleLoading.set(true);
    const body: PermissionLookupRequest = {
      pageKey: this.pageKey(),
      searchTerm: this.roleSearch().trim() || null,
      filter: this.roleFilter(),
      pageIndex: this.rolePageIndex(),
      pageSize: this.rolePageSize(),
      sortBy: this.roleSortField(),
      sortDirection: this.roleSortOrder()
    };

    this.permissionManagementService.getRoleLookUpWithPermission(body).subscribe({
      next: res => {
        const p: Paginate<RoleLookupItem> = res?.value ?? { items: [] };
        this.roles.set(p.items ?? []);
        this.roleTotalPages.set(p.totalPages ?? 0);
        this.roleTotalCount.set(p.totalFilteredItemCount ?? 0);
        this.roleLoading.set(false);
      },
      error: () => this.roleLoading.set(false)
    });
  }

  onRoleSearch(value: string): void {
    this.roleSearch.set(value);
    this.rolePageIndex.set(0);
    clearTimeout(this.roleTimer);
    this.roleTimer = setTimeout(() => this.loadRoles(), 350);
  }

  onRoleFilter(value: string): void {
    this.roleFilter.set(Number(value) as PermissionFilter);
    this.rolePageIndex.set(0);
    this.loadRoles();
  }

  onRolePageChange(index: number): void { this.rolePageIndex.set(index); this.loadRoles(); }
  onRolePageSizeChange(size: number): void { this.rolePageSize.set(size); this.rolePageIndex.set(0); this.loadRoles(); }

  // ============ KULLANICI SIRALAMA VE YÜKLEME ============
  toggleUserSort(field: string): void {
    let newOrder: 'asc' | 'desc' | '' = 'asc';

    if (this.userSortField() === field) {
      newOrder = this.userSortOrder() === 'asc'
        ? 'desc'
        : this.userSortOrder() === 'desc' ? '' : 'asc';
    }

    this.userSortField.set(newOrder === '' ? '' : field);
    this.userSortOrder.set(newOrder);
    this.userPageIndex.set(0);
    this.loadUsers();
  }

  loadUsers(): void {
    if (!this.pageKey()) return;
    this.userLoading.set(true);
    const body: PermissionLookupRequest = {
      pageKey: this.pageKey(),
      searchTerm: this.userSearch().trim() || null,
      filter: this.userFilter(),
      pageIndex: this.userPageIndex(),
      pageSize: this.userPageSize(),
      sortBy: this.userSortField(),
      sortDirection: this.userSortOrder()
    };

    this.permissionManagementService.getUserLookUpWithPermission(body).subscribe({
      next: res => {
        const p: Paginate<UserLookupItem> = res?.value ?? { items: [] };
        this.users.set(p.items ?? []);
        this.userTotalPages.set(p.totalPages ?? 0);
        this.userTotalCount.set(p.totalFilteredItemCount ?? 0);
        this.userLoading.set(false);
      },
      error: () => this.userLoading.set(false)
    });
  }

  onUserSearch(value: string): void {
    this.userSearch.set(value);
    this.userPageIndex.set(0);
    clearTimeout(this.userTimer);
    this.userTimer = setTimeout(() => this.loadUsers(), 350);
  }

  onUserFilter(value: string): void {
    this.userFilter.set(Number(value) as PermissionFilter);
    this.userPageIndex.set(0);
    this.loadUsers();
  }

  onUserPageChange(index: number): void { this.userPageIndex.set(index); this.loadUsers(); }
  onUserPageSizeChange(size: number): void { this.userPageSize.set(size); this.userPageIndex.set(0); this.loadUsers(); }

  // ============ DÜZENLE MODALI ============
  openEdit(id: string, name: string, isRole: boolean): void {
    this.modalPagePerms = [];
    this.modalGroupPerms = [];
    this.selectedTarget.set({ id, name, isRole });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedTarget.set(null);
  }

  fetchPermissionsFn = (id: string) => {
    const target = this.selectedTarget();
    if (target?.isRole) { 
      return this.roleService.getAssignedPermissions(id);
    }
    return this.userPermissionService.GetListByUserId(id);
  };

  onPagePerms(list: any[]): void { this.modalPagePerms = list; }
  onGroupPerms(list: any[]): void { this.modalGroupPerms = list; }

  savePermissions(): void {
    const target = this.selectedTarget();
    if (!target || this.saving()) return;
    this.saving.set(true);

    const permissions = [...this.modalPagePerms, ...this.modalGroupPerms];

    // target.isRole durumuna göre roleId veya userId ile permissions'ı birleştirip body olarak gönderiyoruz
    const body = target.isRole
      ?  { roleId: target.id, permissions, pageKey: this.pageKey() }
      : { userId: target.id, permissions, pageKey: this.pageKey() };

    const save$ = target.isRole
      ? this.permissionManagementService.update(body)
      : this.permissionManagementService.update(body);

    save$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        target.isRole ? this.loadRoles() : this.loadUsers();
      },
      error: () => this.saving.set(false)
    });
  }
}
export type PermissionOwnerType = 1 | 2; // User=1, Role=2

export type PermissionSourceKind = 'Direct' | 'Group' | 'Role' | 'RoleGroup';

export interface PermissionSourceInfo {
  kind: PermissionSourceKind;
  roleName?: string | null;
  menuGroupKey?: string | null;
}

export interface PermissionReportFilter {
  ownerType?: PermissionOwnerType;
  userId?: string;
  roleId?: string;
  menuGroupId?: number;
  pageId?: number;
  hasFlag?: number;
  onlyGranted: boolean;
}

export interface PermissionReportItem {
  ownerType: PermissionOwnerType;
  ownerId: string;
  ownerName: string;

  pageId: number;
  pageKey: string;          // "Page_Users"
  key: string;              // "Users" → 'Page.' + key ile çevrilir
  menuGroupId?: number | null;
  menuGroupKey?: string | null;  // "Admin" → 'Menu.' + key ile çevrilir

  permissionValue: number;
  sources: PermissionSourceInfo[];

  view: boolean; insert: boolean; update: boolean; delete: boolean;
  setPassive: boolean; setActive: boolean; viewPassive: boolean;
  exportExcel: boolean; importExcel: boolean; managePagePermissions: boolean;
}

export interface LookupItem<T> { id: T; name: string; }

export interface PermissionReportPage {
  pageId: number;
  pageKey: string;
  key: string;
  menuGroupId?: number | null;
  menuGroupKey?: string | null;
  showInMenu: boolean;
}

export interface PermissionReportLookup {
  users: LookupItem<string>[];
  roles: LookupItem<string>[];
  menuGroups: LookupItem<number>[];   // name = MenuGroup.Key (çeviri anahtarı)
  pages: PermissionReportPage[];
}

export type PermissionFlagKey =
  | 'view' | 'insert' | 'update' | 'delete' | 'setPassive' | 'setActive'
  | 'viewPassive' | 'exportExcel' | 'importExcel' | 'managePagePermissions';

export interface PermissionFlagDef {
  value: number;
  key: PermissionFlagKey;
  label: string;
}

export const PAGE_ACCESS_FLAGS: readonly PermissionFlagDef[] = [
  { value: 1,   key: 'view',                  label: 'Label.PermView' },
  { value: 2,   key: 'insert',                label: 'Label.PermInsert' },
  { value: 4,   key: 'update',                label: 'Label.PermUpdate' },
  { value: 64,  key: 'delete',                label: 'Label.PermDelete' },
  { value: 8,   key: 'setPassive',            label: 'Label.PermSetPassive' },
  { value: 32,  key: 'setActive',             label: 'Label.PermSetActive' },
  { value: 16,  key: 'viewPassive',           label: 'Label.PermViewPassive' },
  { value: 128, key: 'exportExcel',           label: 'Label.PermExportExcel' },
  { value: 256, key: 'importExcel',           label: 'Label.PermImportExcel' },
  { value: 512, key: 'managePagePermissions', label: 'Label.PermManagePermissions' },
];
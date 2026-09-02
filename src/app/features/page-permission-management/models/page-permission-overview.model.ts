// models/page-permission-overview.model.ts

export interface PagePermissionAssignmentDto {
  userId?: string;
  userFullName?: string;
  roleId?: string;
  roleName?: string;
  permissionValue: number; // Bitwise yetki değeri (0 ise yetkisi yok)
}

export interface PagePermissionMatrixSaveDto {
  userId?: string;
  roleId?: string;
  permissions: {
    pageName?: string;
    groupKey?: string;
    permissionValue: number;
  }[];
}
export interface RolePermissionItemDto {
  pagePermissionList: RolePagePermissionDto[];
}


export interface RolePagePermissionDto {
  pageName: string;
  permissionValue: number;
}

export interface AssignedUserListItemDto {
  id: string;
  fullName: string;
  eMail: string;
}


export interface UpdateRoleCommand {
  id?: string | null;
  name: string;
  rowVersion?: string | null;
  permissions: RolePagePermissionDto[];
  userIds: string[];
}
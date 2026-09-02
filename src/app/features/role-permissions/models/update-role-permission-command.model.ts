import {RolePagePermissionDto,UpdateRoleCommand  } from '../models/role-permission-item.model'

export interface RolePagePermissionUpdateDto {
  pageName: string;
  permissionValue: number;
}
export interface UpdateRolePermissionsCommand {
  roleId: string;
  permissions: RolePagePermissionUpdateDto[];
}


export interface UpdateRoleUserCommand {
  roleId: string;
  userIds: string[];
}
export interface CreateRoleCommand extends UpdateRoleCommand {
  name: string;
  permissions: RolePagePermissionDto[];
  userIds: string[];
}


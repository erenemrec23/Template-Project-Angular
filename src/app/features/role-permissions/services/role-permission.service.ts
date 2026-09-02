// src/app/features/role-permissions/services/role-permission.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { Result } from '../../../shared/models/results/result.model';
import { UserPermissionItemDto } from '../../user-permissions/models/user-permission-Item.model';

export interface UpdateRolePermissionsCommand {
  roleId: string;
  permissions: any[];
  scope: number; // 1 = Page, 2 = Group
}

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService extends BaseService {

  GetListByRoleId(roleId: string): Observable<Result<UserPermissionItemDto>> {
    return this.get<Result<UserPermissionItemDto>>(`AppRolePermissions/GetListByRoleId?roleId=${roleId}`);
  }

  updateRolePermissions(command: UpdateRolePermissionsCommand): Observable<Result<any>> {
    return this.put<Result<any>>('AppRolePermissions/Update', command);
  }

  updateRolesPermissions(command: { roleIds: string[]; permissions: any[] }): Observable<Result<any>> {
  return this.put<Result<any>>('PagePermissions/UpdateRoles', command);
}
}
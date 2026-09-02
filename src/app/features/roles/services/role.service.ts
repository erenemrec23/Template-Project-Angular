import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud.service';
import { RoleListItemDto } from '../models/role-list-item.model';
import { Result } from '../../../shared/models/results/result.model';
import { BulkCreateRoleCommand } from '../models/bulk-create-role-item-data.model';
import { CreateRoleCommand } from '../../role-permissions/models/update-role-permission-command.model';
import { UpdateRoleCommand } from '../../role-permissions/models/role-permission-item.model';
import { RoleLookUpListItemDto } from '../models/role-lookup-item.model';

@Injectable({ providedIn: 'root' })
export class RoleService extends BaseCrudService<
  RoleListItemDto,
  RoleListItemDto,
  CreateRoleCommand,
  UpdateRoleCommand,
  BulkCreateRoleCommand
> {
  protected readonly baseUrl = 'AppRoles';

  getAssignedPersonnelIds(roleId: string): Observable<Result<string[]>> {
    return this.get<Result<string[]>>(`${this.baseUrl}/GetAssignedUserList?roleId=${roleId}`);
  }

  getAssignedPermissions(roleId: string): Observable<Result<string[]>> {
    return this.get<Result<string[]>>(`${this.baseUrl}/GetAssignedPermissionList?roleId=${roleId}`);
  }
  getLookUpList(): Observable<Result<RoleLookUpListItemDto[]>> {
  return this.get<Result<RoleLookUpListItemDto[]>>(`${this.baseUrl}/GetRoleLookUpList`);
}
}
// src/app/features/users/services/user-permission.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { Result } from '../../../shared/models/results/result.model';
import { UserLookupDto } from '../models/user-look-up.model';
import { UserPermissionItemDto } from '../models/user-permission-Item.model';
import { UpdateUserPermissionsCommand } from '../models/update-user-permission-command.model';
 
@Injectable({
  providedIn: 'root'
})
export class UserPermissionService extends BaseService {

   
   getSystemModules(): Observable<Result<UserLookupDto[]>> {
    return this.get<Result<UserLookupDto[]>>('Modules/GetSystemModules');
  } 
  updateUserPermissions(command: UpdateUserPermissionsCommand): Observable<Result<any>> {
    return this.put<Result<any>>('AppUserPermissions/Update', command);
  }
 

GetListByUserId(userId: string): Observable<Result<UserPermissionItemDto>> { 
  return this.get<Result<UserPermissionItemDto>>(`AppUserPermissions/GetListByUserId?userId=${userId}`);
}

updateUsersPermissions(command: { userIds: string[]; permissions: any[] }): Observable<Result<any>> {
  return this.put<Result<any>>('PagePermissions/UpdateUsers', command);
}
// RolePermissionService

}
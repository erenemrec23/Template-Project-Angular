import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud.service';
import { PermissionLookUpListItemDto, UserListItemDto, UserLookUpListItemDto } from '../models/user-list-item.model';
import { UserItemDto } from '../models/user-item.model';
import { Result } from '../../../shared/models/results/result.model';
import { BulkCreateAppUserCommand } from '../models/bulk-create-user-item-data.model';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseCrudService<
  UserListItemDto,
  UserItemDto,
  UserItemDto,
  UserItemDto,
  BulkCreateAppUserCommand
> {
  // NOT: Orijinal serviste route 'AppUser' (tekil) idi. AppRoles ile aynı çoğul
  // desene geçirdim. Backend controller route'unu doğrula, gerekirse tek satırı değiştir.
  protected readonly baseUrl = 'AppUsers';

  getLookUpList(): Observable<Result<UserLookUpListItemDto[]>> {
    return this.get<Result<UserLookUpListItemDto[]>>(`${this.baseUrl}/GetLookUpList`);
  }
  getUserLookUpWithPermission(): Observable<Result<PermissionLookUpListItemDto[]>> {
    return this.get<Result<PermissionLookUpListItemDto[]>>(`${this.baseUrl}/GetUserLookUpWithPermission`);
  }

  getAssignedRoleIds(userId: string): Observable<Result<string[]>> {
  return this.get<Result<string[]>>(`${this.baseUrl}/GetUserAssignedRoleIds?userId=${userId}`);
}
  disableTwoFactor(userId: string): Observable<Result<void>> {
  return this.post<Result<void>>(`${this.baseUrl}/${userId}/DisableTwoFactor`, {});
}
  
}
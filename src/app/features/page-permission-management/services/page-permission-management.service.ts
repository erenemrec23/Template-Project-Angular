import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { PageRequestBaseDto } from '../../../shared/models/paginate/paginate.model';

export interface PermissionLookupRequest extends PageRequestBaseDto {
  pageKey: string;
  searchTerm: string | null;
  filter: number; 
  sortBy :string;
  sortDirection : string ;
}

export interface UpdateRolePermissionsRequest {
  roleId?: string | undefined;
  permissions: any[];
  pageKey : string;
  userId?: string | undefined;
}

@Injectable({ providedIn: 'root' })
export class PagePermissionManagementService extends BaseService {

  /**
   * Rol listesini yetki durumu bilgisiyle getirir
   */
  getRoleLookUpWithPermission(body: PermissionLookupRequest): Observable<any> {
    return this.post<any>('AppRoles/GetRoleLookUpWithPermission', body);
  }

  /**
   * Kullanıcı listesini yetki durumu bilgisiyle getirir
   */
  getUserLookUpWithPermission(body: PermissionLookupRequest): Observable<any> {
    return this.post<any>('AppUsers/GetUserLookUpWithPermission', body);
  }

  /**
   * Rolün sayfa/grup yetkilerini günceller
   */
  updateRolePermissions(body: UpdateRolePermissionsRequest): Observable<any> {
    return this.post<any>('AppRoles/UpdatePermissions', body);
  }

  update(body: UpdateRolePermissionsRequest): Observable<any> {
    return this.put<any>('PagePermissions/Update', body);
  }
  
}
// shared/services/page-permission.service.ts
import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PagePermissions } from '../../core/constants/permissions.constant';
import { PagePermissionClaim } from '../../features/auth/services/auth.service';

export interface PagePerms {
  view:        boolean;
  insert:      boolean;
  update:      boolean;
  delete:      boolean;
  setPassive:  boolean;
  viewPassive:  boolean;
  setActive:  boolean;
  exportExcel: boolean;
  importExcel: boolean;
  managePagePermissions: boolean;
}

@Injectable({ providedIn: 'root' })
export class PagePermissionService {
  private router = inject(Router);
  private cache  = new Map<string, PagePerms>();

  // ─── Token'dan direkt okuma — AuthService YOK ─────────

  private getTokenPayload(): { userId: string; permissions: PagePermissionClaim[] } | null {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const base64 = token.split('.')[1];
      const json   = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      const raw    = JSON.parse(json);

      const rawPerms = raw['permissions'];
      const permissions: PagePermissionClaim[] = JSON.parse(rawPerms)

      return {
        userId:      raw['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? 'anonymous',
        permissions: permissions
      };
    } catch {
      return null;
    }
  }

  private getPermissionValue(pageName: string): number {
    const payload = this.getTokenPayload();
    if (!payload) return 0;
    return payload.permissions.find(p => p.pageName === pageName)?.permissionValue ?? 0;
  }

  private getCacheKey(page: string): string {
    const userId = this.getTokenPayload()?.userId ?? 'anonymous'; 
    return `${userId}_${page}`;
  }

  // ─── Sayfa adı bazlı metodlar ─────────────────────────

  getPagePermission(pageName: string): number {
    return this.getPermissionValue(pageName);
  }

  can(pageName: string, bit: number): boolean { 
    return (this.getPermissionValue(pageName) & bit) === bit;
  }

  canViewPage(pageName: string): boolean        { return this.can(pageName, PagePermissions.View); }
  canInsertPage(pageName: string): boolean      { return this.can(pageName, PagePermissions.Insert); }
  canUpdatePage(pageName: string): boolean      { return this.can(pageName, PagePermissions.Update); }
  canDeletePage(pageName: string): boolean      { return this.can(pageName, PagePermissions.Delete); }
  canExportExcelPage(pageName: string): boolean { return this.can(pageName, PagePermissions.ExportExcel); }
  canImportExcelPage(pageName: string): boolean { return this.can(pageName, PagePermissions.ImportExcel); }

  // ─── Route bazlı (cache'li) ───────────────────────────

getPermissions(route: ActivatedRoute): PagePerms {
    const page = this.resolvePage(route);
    const key  = this.getCacheKey(page);

    const cached = this.cache.get(key);
    if (cached) return cached;

    const perms: PagePerms = {
      view:                  !page ? true  : this.can(page, PagePermissions.View),
      insert:                !page ? false : this.can(page, PagePermissions.Insert),
      update:                !page ? false : this.can(page, PagePermissions.Update),
      setPassive:            !page ? false : this.can(page, PagePermissions.SetPassive),
      viewPassive:           !page ? false : this.can(page, PagePermissions.ViewPassive),
      setActive:             !page ? false : this.can(page, PagePermissions.SetActive),
      delete:                !page ? false : this.can(page, PagePermissions.Delete),
      exportExcel:           !page ? false : this.can(page, PagePermissions.ExportExcel),
      importExcel:           !page ? false : this.can(page, PagePermissions.ImportExcel),
      managePagePermissions: !page ? false : this.can(page, PagePermissions.ManagePagePermissions), // YENİ
    };

    this.cache.set(key, perms);
    return perms;
  }
  canManagePagePermissions(route: ActivatedRoute, manual?: boolean): boolean {
    return manual !== undefined ? manual && this.getPermissions(route).managePagePermissions : this.getPermissions(route).managePagePermissions;
  }
  canView(route: ActivatedRoute, manual?: boolean): boolean {
    return manual !== undefined ? manual && this.getPermissions(route).view : this.getPermissions(route).view;
  }

  canInsert(route: ActivatedRoute, manual?: boolean): boolean {
    return manual !== undefined ? manual && this.getPermissions(route).insert : this.getPermissions(route).insert;
  }

  canUpdate(route: ActivatedRoute, manual?: boolean): boolean {
    return manual !== undefined ? manual && this.getPermissions(route).update : this.getPermissions(route).update;
  }

  canViewPassive(route: ActivatedRoute, manual?: boolean): boolean {
    return manual !== undefined ? manual && this.getPermissions(route).viewPassive : this.getPermissions(route).viewPassive;
  }
  canSetPassive(route: ActivatedRoute, manual?: boolean): boolean {
    return manual !== undefined ? manual && this.getPermissions(route).setPassive : this.getPermissions(route).setPassive;
  }
  canSetActive(route: ActivatedRoute, manual?: boolean): boolean {
    return manual !== undefined ? manual && this.getPermissions(route).setActive : this.getPermissions(route).setActive;
  }
  canDelete(route: ActivatedRoute, manual?: boolean): boolean {
    return manual !== undefined ? manual && this.getPermissions(route).delete : this.getPermissions(route).delete;
  }

  canExportExcel(route: ActivatedRoute, manual?: boolean): boolean {
    return manual !== undefined ? manual && this.getPermissions(route).exportExcel : this.getPermissions(route).exportExcel;
  }

  canImportExcel(route: ActivatedRoute, manual?: boolean): boolean {
    return manual !== undefined ? manual && this.getPermissions(route).importExcel : this.getPermissions(route).importExcel;
  }

  clearCache(): void {
    this.cache.clear();
  }

  resolvePage(route: ActivatedRoute): string {
    if (route.snapshot.data['page'])
      return route.snapshot.data['page'] as string;

    const urlSegment = this.router.url.split('/')[1]?.split('?')[0] ?? '';
    return this.urlToPageName(urlSegment);
  }

  private urlToPageName(segment: string): string {
    if (!segment) return '';
    const pascal = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return `${pascal}`;
  }
}
// features/auth/services/auth.service.ts
import { Injectable, signal, computed, inject, Injector } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { LoginRequestDto } from '../models/login-request.model';
import { LoginResponseDto } from '../models/login-response.model';
import { Result } from '../../../shared/models/results/result.model';
import { PagePermissionService } from '../../../shared/services/page-permission.service'
import { ForgotPasswordRequestDto } from '../models/forgot-password-request.model';
import { ResetPasswordRequestDto } from '../models/reset-password-request.model';

export interface PagePermissionClaim {
  pageName: string;
  permissionValue: number;
}

interface RawTokenPayload {
  nameid: string;
  email: string;
  unique_name: string;
  FullName: string;
  TenantId: string;
  permissions: string | string[];
  exp: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  userName: string;
  fullName: string;
  tenantId: string;
  permissions: PagePermissionClaim[];
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService {
  pagePermissionService    = inject(PagePermissionService);
  isAuthenticated     = signal<boolean>(this.checkToken());
  private _payload    = signal<TokenPayload | null>(this.decodeToken());

  readonly currentUser = computed(() => this._payload());
  readonly permissions = computed(() => this._payload()?.permissions ?? []);

  login(credentials: LoginRequestDto): Observable<Result<LoginResponseDto>> {
  return this.post<Result<LoginResponseDto>>('Auth/Login', credentials).pipe(
    tap(res => {
      // Sadece token GERCEKTEN geldiyse oturum ac. 2FA gerekiyorsa token null gelir.
      if (res.isSuccess && res.value?.token) {
        localStorage.setItem('token', res.value.token);
        this._payload.set(this.decodeToken());
        this.isAuthenticated.set(true);
      }
    })
  );
}

loginTwoFactor(userId: string, code: string): Observable<Result<LoginResponseDto>> {
  return this.post<Result<LoginResponseDto>>('Auth/LoginTwoFactor', { userId, code }).pipe(
    tap(res => {
      if (res.isSuccess && res.value?.token) {
        localStorage.setItem('token', res.value.token);
        this._payload.set(this.decodeToken());
        this.isAuthenticated.set(true);
      }
    })
  );
}

  logout(): void {
    localStorage.removeItem('token');
    this._payload.set(null);
    this.isAuthenticated.set(false); 
     this.pagePermissionService.clearCache();
  }

  private decodeToken(): TokenPayload | null {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const base64 = token.split('.')[1];
      const json   = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      const raw: RawTokenPayload = JSON.parse(json);

      const rawPerms = raw.permissions;
      const permStrings: string[] = !rawPerms
        ? []
        : Array.isArray(rawPerms) ? rawPerms : [rawPerms];

      return {
        userId:      raw.nameid,
        email:       raw.email,
        userName:    raw.unique_name,
        fullName:    raw.FullName,
        tenantId:    raw.TenantId,
        permissions: permStrings.map(p => JSON.parse(p)),
        exp:         raw.exp
      };
    } catch {
      return null;
    }
  }

  private checkToken(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.warn('Token süresi dolmuş!');
        return false;
      }
      if (!payload['TenantId']) {
        console.warn('TenantId bulunamadı!');
        localStorage.removeItem('token');
        return false;
      }
      return true;
    } catch {
      console.warn('Token parse edilemedi!');
      localStorage.removeItem('token');
      return false;
    }
  }

  forgotPassword(request: ForgotPasswordRequestDto): Observable<Result<void>> {
  return this.post<Result<void>>('Auth/ForgotPassword', request);
}

resetPassword(request: ResetPasswordRequestDto): Observable<Result<void>> {
  return this.post<Result<void>>('Auth/ResetPassword', request);
}
}
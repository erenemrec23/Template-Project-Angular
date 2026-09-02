// shared/services/base.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class BaseService {
  protected http      = inject(HttpClient);
  protected translate = inject(TranslateService);

  t(key: string): string {
    return this.translate.instant(key);
  }

  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(endpoint);
  }

  protected post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(endpoint, data);
  }

  protected postExcel<T>(endpoint: string, data: any, options?: any): Observable<any> {
    return this.http.post<T>(endpoint, data, options);
  }

  protected put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(endpoint,data);
  }

  // Yeni Eklenen PATCH Metodu
  protected patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(endpoint, data);
  }

  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(endpoint);
  }
 protected deleteBulk<T>(endpoint: string, payload: any): Observable<T> {
  return this.http.patch<T>(endpoint, payload);
}
}
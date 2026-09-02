import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../shared/models/results/result.model';
import { PermissionReportFilter, PermissionReportItem, PermissionReportLookup } from './permission-report.models';

@Injectable({ providedIn: 'root' })
export class PermissionReportService {
  private readonly http = inject(HttpClient);
  private readonly base = 'permission-report';

  getReport(f: PermissionReportFilter): Observable<Result<PermissionReportItem[]>> {
    return this.http.get<Result<PermissionReportItem[]>>(this.base, { params: this.toParams(f) });
  }

  getLookups(): Observable<Result<PermissionReportLookup>> {
    return this.http.get<Result<PermissionReportLookup>>(`${this.base}/lookups`);
  }

  exportExcel(f: PermissionReportFilter): Observable<Blob> {
    return this.http.get(`${this.base}/export-excel`, { params: this.toParams(f), responseType: 'blob' });
  }

  private toParams(f: PermissionReportFilter): HttpParams {
    let p = new HttpParams().set('onlyGranted', String(f.onlyGranted));
    (['ownerType', 'userId', 'roleId', 'menuGroupId', 'pageId', 'hasFlag'] as const).forEach(k => {
      const v = f[k];
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return p;
  }
}
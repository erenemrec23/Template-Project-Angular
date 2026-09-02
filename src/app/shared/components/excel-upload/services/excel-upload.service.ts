// src/app/shared/components/excel-upload/services/excel-upload.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent } from '@angular/common/http';
import { BaseService } from '../../../services/base.service'; // Projendeki base.service yoluna göre ayarla

@Injectable({
  providedIn: 'root'
})
export class ExcelUploadService extends BaseService {
  
  // BaseService üzerindeki jenerik post metodunu tetikliyoruz
  uploadExcel(apiUrl: string, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Tıpkı TenantService'de yaptığın gibi doğrudan this.post kullanıyoruz
    // Progress ve Event takibini kaçırmamak için options nesnesini içeriye fırlatıyoruz
    return this.postExcel<HttpEvent<any>>(apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
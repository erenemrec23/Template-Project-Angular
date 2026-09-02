import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent } from '@angular/common/http';
import { BaseService } from '../../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelImportModalService extends BaseService {
  
  uploadExcel(apiUrl: string, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file, file.name || 'uploaded_file.xlsx'); 

    return this.postExcel<HttpEvent<any>>(apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
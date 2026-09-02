// core/loaders/api-translate-loader.ts
import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment'; // Environment import'unu ekleyin

export class ApiTranslateLoader implements TranslateLoader {
  private http: HttpClient;
  private readonly baseUrl = `${environment.apiUrl}/Localization`;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * ngx-translate dil değişimlerinde otomatik olarak bu metodu tetikler.
   * lang parametresine 'tr-TR' veya 'en-US' gelir.
   */
  getTranslation(lang: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${lang}`).pipe(
      map(response => {
        if (response && response.isSuccess) {
          return response.data;
        }
        return response;
      })
    );
  }
}
// core/interceptors/api.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Eğer istek zaten "http" ile başlıyorsa (örn: harici bir harita API'si) dokunma, 
  // içermiyorsa bizim ana api URL'imizi başına ekle
  const router = inject(Router);
  const apiReq = req.url.startsWith('http') 
    ? req 
    : req.clone({ url: `${environment.apiUrl}/${req.url}` });
if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(apiReq.method)) {
    apiReq.clone({ setHeaders: { 'X-Source-Page': router.url } });
  }
  return next(apiReq);
};
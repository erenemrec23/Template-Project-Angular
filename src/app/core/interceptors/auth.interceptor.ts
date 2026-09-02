import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Token'ı LocalStorage'dan al
  const token = localStorage.getItem('token'); 

  // 2. Token varsa, isteği kopyala ve içine Authorization başlığını ekle
  const router = inject(Router);
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Boşluğa dikkat!
      }
    });
  }
if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    req = req.clone({ setHeaders: { 'X-Source-Page': router.url } });
  }
  // 3. İsteği bir sonraki adıma (Backend'e) ilet
  return next(req);
};
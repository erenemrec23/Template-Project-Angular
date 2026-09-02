// core/interceptors/error.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, throwError, of } from 'rxjs';
import { ErrorModalService } from '../services/error-modal.service';
import { HANDLE_ERROR_LOCALLY } from '../../core/http-context/error-handling.context'
import { TranslateService } from '@ngx-translate/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const errorModal = inject(ErrorModalService);
  const handleLocally = req.context.get(HANDLE_ERROR_LOCALLY);
  const translate = inject(TranslateService);
 
  return next(req).pipe(

    // 1. 200 OK dönüp isSuccess: false olan business hataları
    tap((event) => {
      
      if (event instanceof HttpResponse) {
        const body = event.body as any;
        if (body?.isSuccess === false) {
          const message = body?.error?.message || translate.instant("Error.WorkRegimeEstablished");
          errorModal.show(message);
        }
      }
    }),

    // 2. HTTP hata kodları (400, 401, 403, 500...)
    catchError((error: HttpErrorResponse) => {

      const body = error.error;
      const isBusinessError = body && body.isSuccess === false;
       if (isBusinessError && handleLocally) {
        return of(new HttpResponse({ body, status: error.status, url: error.url ?? undefined }));
      }
      switch (error.status) {
        case 401:
          console.warn('Oturum süresi doldu.');
          localStorage.removeItem('token');
          router.navigate(['/login']);
          break;

        case 403:
          console.warn('Yetkisiz erişim:', error.url);
          router.navigate(['/403']);
          break;

        case 400: {
          const message = error.error?.error?.message || translate.instant("Error.InvalidRequest");
          errorModal.show(message);
          break;
        }

        case 500: {
          const message = error.error?.error?.message || translate.instant("Error.SystemErrorOccurred");
          errorModal.show(message);
          break;
        }

        default: {
          const message = error.error?.error?.message || translate.instant("Error.InternalServerError");
          errorModal.show(message);
        }
      }

      return throwError(() => error);
    })
  );
};
// src/app/app.config.ts
import { ApplicationConfig, provideZonelessChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ApiTranslateLoader } from './core/loaders/api-translate-loader';

// HttpClient bağımlılığını çözen fabrika fonksiyonu
export function createApiTranslateLoader(http: HttpClient) {
  return new ApiTranslateLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    provideHttpClient(
      withInterceptors([authInterceptor, apiInterceptor, errorInterceptor])
    ),
    
    // Angular 21+ Standalone Dil Sağlayıcısı
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: createApiTranslateLoader,
        deps: [HttpClient]
      }
    }),
    
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection() // Angular 21 Standartı: Zone.js yok, maksimum hız!
  ]
};
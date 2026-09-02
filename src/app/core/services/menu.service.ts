import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { BaseService } from '../../shared/services/base.service';
import { Result } from '../../shared/models/results/result.model';
import { MenuGroupConfig } from '../constants/pages';

@Injectable({ providedIn: 'root' })
export class MenuService extends BaseService {
  private cache$?: Observable<Result<MenuGroupConfig[]>>;

  /**
   * Giris yapan kullaniciya gore SUNUCUDA filtrelenmis menuyu getirir.
   * (Tum menu artik network'e cikmaz.) Ilk cagrida API'ye istek atar,
   * sonraki cagrilarda onbellekteki veriyi sunar.
   */
  getMenu(): Observable<Result<MenuGroupConfig[]>> {
    this.cache$ ??= this.get<Result<MenuGroupConfig[]>>('Modules/GetUserMenu').pipe(
      shareReplay(1),
      catchError((err) => {
        // İstek hata alırsa önbelleği temizle ki sonraki getMenu() çağrısında tekrar denenebilsin
        this.clearCache();
        return throwError(() => err);
      })
    );
    return this.cache$;
  }

  /**
   * Önbelleği temizler. Bir sonraki getMenu() çağrısında API'ye yeni istek atılır.
   */
  clearCache(): void {
    this.cache$ = undefined;
  }

  /**
   * Önbelleği sıfırlayarak doğrudan güncel veriyi API'den çeker.
   */
  refreshMenu(): Observable<Result<MenuGroupConfig[]>> {
    this.clearCache();
    return this.getMenu();
  }
}
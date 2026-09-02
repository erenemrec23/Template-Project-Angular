import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { BaseService } from '../../shared/services/base.service';
import { Result } from '../../shared/models/results/result.model';
import { PageCatalogItemDto } from '../models/page-catalog-item.model';

@Injectable({ providedIn: 'root' })
export class PageCatalogService extends BaseService {
  private menuCache$?: Observable<Result<PageCatalogItemDto[]>>;

  /**
   * 1. Uncached Metot:
   * Yetkilendirme / matris sayfaları gibi taze ve spesifik (singlePage filtreli)
   * veri gerektiren durumlar için kullanılır.
   */
  getSystemModules(singlePage?: string | null): Observable<Result<PageCatalogItemDto[]>> {
    const query = singlePage ? `?pageKey=${encodeURIComponent(singlePage)}` : '';
    return this.get<Result<PageCatalogItemDto[]>>(`Modules/GetSystemModules${query}`);
  }

  /**
   * 2. Cached Metot:
   * Menü veya genel navigasyon gibi uygulama boyunca tek bir hamleyle
   * yüklenip tekrar HTTP isteği atmaması gereken yerler için kullanılır.
   */
  getSystemModulesCached(): Observable<Result<PageCatalogItemDto[]>> {
    this.menuCache$ ??= this.get<Result<PageCatalogItemDto[]>>('Modules/GetSystemModules').pipe(
      shareReplay(1)
    );
    return this.menuCache$;
  }

  /**
   * İhtiyaç durumunda (örn. sayfa ekleme/düzenleme sonrası)
   * menü önbelleğini temizlemek için kullanılan yardımcı metot.
   */
  clearMenuCache(): void {
    this.menuCache$ = undefined;
  }
}
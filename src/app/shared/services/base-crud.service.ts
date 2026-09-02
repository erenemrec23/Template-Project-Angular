
import { Observable } from 'rxjs';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import { BaseService } from './base.service';
import { Result } from '../models/results/result.model';
import { PageRequestBaseDto, Paginate } from '../models/paginate/paginate.model';

export abstract class BaseCrudService<
  TListItemDto,
  TDetailDto = TListItemDto,
  TCreateCommand = TDetailDto,
  TUpdateCommand = TDetailDto,
  TBulkCreateCommand = unknown
> extends BaseService {

  protected abstract readonly baseUrl: string;

  // --- Mevcut Observable API (create/update/delete gibi aksiyonlar için sabit kalıyor) ---

  getList(request: PageRequestBaseDto): Observable<Result<Paginate<TListItemDto>>> {
    return this.post<Result<Paginate<TListItemDto>>>(`${this.baseUrl}/GetList`, request);
  }

  getPassivedList(request: PageRequestBaseDto): Observable<Result<Paginate<TListItemDto>>> {
    return this.post<Result<Paginate<TListItemDto>>>(`${this.baseUrl}/GetPassivedList`, request);
  }

  getById(id: string): Observable<Result<TDetailDto>> {
    return this.get<Result<TDetailDto>>(`${this.baseUrl}/${id}`);
  }

  getPassivedById(id: string): Observable<Result<TDetailDto>> {
    return this.get<Result<TDetailDto>>(`${this.baseUrl}/Passived/${id}`);
  }

  create(data: TCreateCommand): Observable<Result<TListItemDto>> {
    return this.post<Result<TListItemDto>>(`${this.baseUrl}/Create`, data);
  }

  update(data: TUpdateCommand): Observable<Result<TListItemDto>> {
    return this.put<Result<TListItemDto>>(`${this.baseUrl}/Update`, data);
  }

  deleteById(id?: string | number): Observable<Result<string>> {
    return this.delete<Result<string>>(`${this.baseUrl}/${id}`);
  }

  exportList(request: PageRequestBaseDto): Observable<Blob> {
    // DİKKAT: responseType 'blob' olmazsa inen dosya bozuk çıkar!
    return this.http.post(`${this.baseUrl}/export`, request, { responseType: 'blob' });
  }

  exportSampleList(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/sample-export`, { responseType: 'blob' });
  }

  bulkCreate(command: TBulkCreateCommand): Observable<Result<string[]>> {
    return this.post<Result<string[]>>(`${this.baseUrl}/bulk-create`, command);
  }

  bulkDeleteByIds(ids: string[]): Observable<Result<string>> {
    return this.deleteBulk<Result<string>>(`${this.baseUrl}/Bulk-Delete`, { idList: ids });
  }

  setActiveById(id: string | number): Observable<Result<string>> {
    return this.put<Result<string>>(`${this.baseUrl}/SetActive/${id}`, {});
  }

  setPassiveById(id: string | number): Observable<Result<string>> {
    return this.put<Result<string>>(`${this.baseUrl}/SetPassive/${id}`, {});
  }

  bulkSetActiveByIds(ids: string[]): Observable<Result<string>> {
    return this.patch<Result<string>>(`${this.baseUrl}/Bulk-SetActive`, { idList: ids });
  }

  bulkSetPassiveByIds(ids: string[]): Observable<Result<string>> {
    return this.patch<Result<string>>(`${this.baseUrl}/Bulk-SetPassive`, { idList: ids });
  }

  // --- YENİ (Angular 21 stabil): reaktif liste okuma, signal-driven ---
  // request bir Signal olduğu için parametre değiştikçe otomatik yeniden istek atar,
  // race condition'ları (eski response'un geç dönmesi) kendisi handle eder.
  listResource(
    request: () => PageRequestBaseDto
  ): HttpResourceRef<Result<Paginate<TListItemDto>> | undefined> {
    return httpResource<Result<Paginate<TListItemDto>>>(() => ({
      url: `${this.baseUrl}/GetList`,
      method: 'POST',
      body: request(),
    }));
  }
}
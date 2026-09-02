// src/app/features/tenants/services/tenant.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TenantService } from './tenant.service';
import { TenantListItemDto } from '../models/tenant-list-item.model';
import { Result } from '../../../shared/models/results/result.model';
import { PageRequestBaseDto, Paginate } from '../../../shared/models/paginate/paginate.model';

describe('TenantService', () => {
  let service: TenantService;
  let httpMock: HttpTestingController;

  // Yeni Result model mimarisine tam uyumlu Mock Hata Nesnesi
  const mockNoError = { code: '', message: '' };
  const mockTenant: TenantListItemDto = { id: '1', name: 'Test Tenant' } as any;
  
  // Başarılı durumlar için ortak Result şablonu
  const mockResult: Result<TenantListItemDto> = { 
    value: mockTenant, 
    isSuccess: true, 
    isFailure: false, 
    error: mockNoError 
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TenantService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TenantService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Bekleyen asılı istek kalmadığını doğrular
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // 1. GetList Testi
  it('should fetch pagination list of tenants with filters (getList)', () => {
    const pageRequest: PageRequestBaseDto = { 
      pageIndex: 0, 
      pageSize: 10,
      globalSearch: { fields: ['name'], value: 'Test' },
      dynamicFilterAndSort: null
    };

    // Yeni Result ve Paginate yapısına tam uyumlu mock veri
    const mockPaginateResult: Result<Paginate<TenantListItemDto>> = {
      isSuccess: true,
      isFailure: false,
      error: mockNoError,
      value: { 
        items: [mockTenant], 
        index: 0, 
        pageSize: 10, 
        totalFilteredItemCount: 1,
        totalItemCount: 1,
        totalPages: 1, 
        hasPrevious: false, 
        hasNext: false 
      }
    };

    service.getList(pageRequest).subscribe((response) => {
      expect(response).toEqual(mockPaginateResult);
      expect(response.isSuccess).toBeTrue();
      expect(response.isFailure).toBeFalse();
      expect(response.value.items.length).toBe(1);
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('Tenants/GetList'));
    expect(req.request.method).toBe('POST');
    req.flush(mockPaginateResult);
  });

  // 2. GetById Testi
  it('should fetch a single tenant by id (getById)', () => {
    const tenantId = '123';

    service.getById(tenantId).subscribe((response) => {
      expect(response).toEqual(mockResult);
      expect(response.isSuccess).toBeTrue();
      expect(response.value.id).toBe('1');
    });

    const req = httpMock.expectOne((request) => request.url.endsWith(`Tenants/${tenantId}`));
    expect(req.request.method).toBe('GET');
    req.flush(mockResult);
  });

  // 3. Create Testi
  it('should create a new tenant (create)', () => {
    service.create(mockTenant).subscribe((response) => {
      expect(response).toEqual(mockResult);
      expect(response.isSuccess).toBeTrue();
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('Tenants/Create'));
    expect(req.request.method).toBe('POST');
    req.flush(mockResult);
  });

  // 4. Update Testi
  it('should update an existing tenant (update)', () => {
    service.update(mockTenant).subscribe((response) => {
      expect(response).toEqual(mockResult);
      expect(response.isSuccess).toBeTrue();
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('Tenants/Update'));
    expect(req.request.method).toBe('PUT');
    req.flush(mockResult);
  });

  // 5. DeleteById Testi
  it('should delete a tenant by id (deleteById)', () => {
    const tenantId = '123';
    const mockDeleteResult: Result<string> = { 
      value: tenantId, 
      isSuccess: true, 
      isFailure: false, 
      error: mockNoError 
    };

    service.deleteById(tenantId).subscribe((response) => {
      expect(response.isSuccess).toBeTrue();
      expect(response.value).toBe(tenantId);
    });

    const req = httpMock.expectOne((request) => request.url.endsWith(`Tenants/${tenantId}`));
    expect(req.request.method).toBe('DELETE');
    req.flush(mockDeleteResult);
  });

  // 6. Excel Export (Blob) Testi
  it('should export tenants list as an Excel Blob (exportList)', () => {
    const pageRequest: PageRequestBaseDto = { pageIndex: 0, pageSize: 100, dynamicFilterAndSort: null, globalSearch: null };
    const mockBlob = new Blob(['mock-excel-binary-data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    service.exportList(pageRequest).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response instanceof Blob).toBeTrue();
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('Tenants/export'));
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });
});
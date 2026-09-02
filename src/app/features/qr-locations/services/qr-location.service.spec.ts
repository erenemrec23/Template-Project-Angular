// src/app/features/qr-locations/services/qr-location.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QrLocationService } from './qr-location.service';
import { QrLocationListItemDto } from '../models/qr-location-list-item.model';
import { Result } from '../../../shared/models/results/result.model';
import { PageRequestBaseDto, Paginate } from '../../../shared/models/paginate/paginate.model';

describe('QrLocationService', () => {
  let service: QrLocationService;
  let httpMock: HttpTestingController;

  // Yeni Result model mimarisine tam uyumlu Mock Hata Nesnesi
  const mockNoError = { code: '', message: '' };
  const mockQrLocation: QrLocationListItemDto = { id: '1', name: 'Test QrLocation' } as any;

  // Başarılı durumlar için ortak Result şablonu
  const mockResult: Result<QrLocationListItemDto> = {
    value: mockQrLocation,
    isSuccess: true,
    isFailure: false,
    error: mockNoError
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QrLocationService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(QrLocationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Bekleyen asılı istek kalmadığını doğrular
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // 1. GetList Testi
  it('should fetch pagination list of qr-locations with filters (getList)', () => {
    const pageRequest: PageRequestBaseDto = {
      pageIndex: 0,
      pageSize: 10,
      globalSearch: { fields: ['name'], value: 'Test' },
      dynamicFilterAndSort: null
    };

    // Yeni Result ve Paginate yapısına tam uyumlu mock veri
    const mockPaginateResult: Result<Paginate<QrLocationListItemDto>> = {
      isSuccess: true,
      isFailure: false,
      error: mockNoError,
      value: {
        items: [mockQrLocation],
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

    const req = httpMock.expectOne((request) => request.url.endsWith('QrLocations/GetList'));
    expect(req.request.method).toBe('POST');
    req.flush(mockPaginateResult);
  });

  // 2. GetById Testi
  it('should fetch a single qr-location by id (getById)', () => {
    const qrLocationId = '123';

    service.getById(qrLocationId).subscribe((response) => {
      expect(response).toEqual(mockResult);
      expect(response.isSuccess).toBeTrue();
      expect(response.value.id).toBe('1');
    });

    const req = httpMock.expectOne((request) => request.url.endsWith(`QrLocations/${qrLocationId}`));
    expect(req.request.method).toBe('GET');
    req.flush(mockResult);
  });

  // 3. Create Testi
  it('should create a new qr-location (create)', () => {
    service.create(mockQrLocation).subscribe((response) => {
      expect(response).toEqual(mockResult);
      expect(response.isSuccess).toBeTrue();
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('QrLocations/Create'));
    expect(req.request.method).toBe('POST');
    req.flush(mockResult);
  });

  // 4. Update Testi
  it('should update an existing qr-location (update)', () => {
    service.update(mockQrLocation).subscribe((response) => {
      expect(response).toEqual(mockResult);
      expect(response.isSuccess).toBeTrue();
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('QrLocations/Update'));
    expect(req.request.method).toBe('PUT');
    req.flush(mockResult);
  });

  // 5. DeleteById Testi
  it('should delete a qr-location by id (deleteById)', () => {
    const qrLocationId = '123';
    const mockDeleteResult: Result<string> = {
      value: qrLocationId,
      isSuccess: true,
      isFailure: false,
      error: mockNoError
    };

    service.deleteById(qrLocationId).subscribe((response) => {
      expect(response.isSuccess).toBeTrue();
      expect(response.value).toBe(qrLocationId);
    });

    const req = httpMock.expectOne((request) => request.url.endsWith(`QrLocations/${qrLocationId}`));
    expect(req.request.method).toBe('DELETE');
    req.flush(mockDeleteResult);
  });

  // 6. Excel Export (Blob) Testi
  it('should export qr-locations list as an Excel Blob (exportList)', () => {
    const pageRequest: PageRequestBaseDto = { pageIndex: 0, pageSize: 100, dynamicFilterAndSort: null, globalSearch: null };
    const mockBlob = new Blob(['mock-excel-binary-data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    service.exportList(pageRequest).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response instanceof Blob).toBeTrue();
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('QrLocations/export'));
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });
});

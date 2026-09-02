import { Injectable } from '@angular/core';
import { BaseCrudService } from '../../../shared/services/base-crud.service';
import { QrLocationListItemDto } from '../models/qr-location-list-item.model';
import { BulkCreateQrLocationCommand } from '../models/bulk-create-qr-location-item-data.model';

@Injectable({ providedIn: 'root' })
export class QrLocationService extends BaseCrudService<
  QrLocationListItemDto,
  QrLocationListItemDto,
  QrLocationListItemDto,
  QrLocationListItemDto,
  BulkCreateQrLocationCommand
> {
  protected readonly baseUrl = 'QrLocations';
}

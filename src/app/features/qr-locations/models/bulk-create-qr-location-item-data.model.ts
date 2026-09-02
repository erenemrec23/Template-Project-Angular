import { BulkCreateQrLocationInputDto } from './bulk-create-qr-location-input.model';

export interface BulkCreateQrLocationCommand {
  items: BulkCreateQrLocationInputDto[];
}

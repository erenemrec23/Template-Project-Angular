import { BaseListItemDto } from '../../../shared/models/base-list-item.model';

export interface QrLocationListItemDto extends BaseListItemDto {
  id?: string;
  name: string;
  startDate?: string;
  endDate?: string;
  locationName?: string;
  rowVersion: string;
}

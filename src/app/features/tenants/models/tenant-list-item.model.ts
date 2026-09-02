import { BaseListItemDto } from "../../../shared/models/base-list-item.model";

export interface TenantListItemDto extends BaseListItemDto {
  id?: string;               
  name: string;               
  startDate?: string;         
  endDate?: string;          
  locationName?: string;      
  parentLocationId?: string;  
  parentLocationName?: string;
  rowVersion: string; 
}



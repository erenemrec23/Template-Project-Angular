 import { BaseListItemDto } from "../../../shared/models/base-list-item.model";

 export interface RoleListItemDto extends BaseListItemDto {
  id: string;   // .NET tarafındaki Guid veya string Id karşılığı
  name: string; // Rol adı
  
}





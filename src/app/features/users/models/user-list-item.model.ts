import { BaseListItemDto } from "../../../shared/models/base-list-item.model";

// Liste satiri DTO'su. AppRole tarafindaki RoleListItemDto : BaseListItemDto ile ayni desen.
// RevNum + audit kullanici adlari + tarihler base'den (BaseListItemDto) geliyor.
export interface UserListItemDto extends BaseListItemDto {
  id: string;        // .NET tarafindaki Guid karsiligi
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}
export interface UserLookUpListItemDto extends BaseListItemDto {
  id: string;         
  fullName: string; 
}

export interface PermissionLookUpListItemDto  {
  id: string;         
  Name: string;       
  HasPermission: boolean; 
}
 
import { UserListItemDto } from './user-list-item.model';

// Form / GetById DTO'su. AppRole tarafindaki RoleItemDto : RoleListItemDto ile ayni desen.
// Backend AppUserItemDto : BaseItemDto icinde RowVersion tasidigi icin buraya da ekliyoruz.
export interface UserItemDto extends UserListItemDto {
  rowVersion?: string;
  twoFactorEnabled?: boolean; 
}

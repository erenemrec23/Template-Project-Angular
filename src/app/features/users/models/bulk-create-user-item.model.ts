// AppRole tarafindaki BulkCreateRoleItemDto ile ayni desen (excel toplu ekleme satiri).
export interface BulkCreateAppUserItemDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

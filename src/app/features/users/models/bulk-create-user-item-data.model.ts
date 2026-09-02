import { BulkCreateAppUserItemDto } from "./bulk-create-user-item.model";

// AppRole tarafindaki BulkCreateRoleCommand ile ayni desen.
export interface BulkCreateAppUserCommand {
  items: BulkCreateAppUserItemDto[];
}

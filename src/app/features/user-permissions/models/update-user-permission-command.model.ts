import { UserPermissionUpdateDto } from "./user-permission-update.model";

export interface UpdateUserPermissionsCommand {
  userId: string;
  permissions: UserPermissionUpdateDto[]; 
}
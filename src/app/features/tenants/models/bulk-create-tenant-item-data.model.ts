import { BulkCreateTenantInputDto } from "./bulk-create-tenant-input.model.ts";
export interface BulkCreateTenantCommand  {  
                items: BulkCreateTenantInputDto[]; 
}


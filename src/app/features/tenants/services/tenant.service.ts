import { Injectable } from '@angular/core';
import { BaseCrudService } from '../../../shared/services/base-crud.service';
import { TenantListItemDto } from '../models/tenant-list-item.model';
import { BulkCreateTenantCommand } from '../models/bulk-create-tenant-item-data.model';

@Injectable({ providedIn: 'root' })
export class TenantService extends BaseCrudService<
  TenantListItemDto,
  TenantListItemDto,
  TenantListItemDto,
  TenantListItemDto,
  BulkCreateTenantCommand
> {
  protected readonly baseUrl = 'Tenants';
}
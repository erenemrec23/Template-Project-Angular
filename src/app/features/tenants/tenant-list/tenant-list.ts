import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseListDirective } from '../../../shared/directives/base-list.directive';
import { FilterFieldConfig, IListService } from '../../../shared/models/list-config.model';
import { TableToolbarComponent } from '../../../shared/components/table/table-toolbar/table-toolbar';
import { TablePaginationComponent } from '../../../shared/components/table/table-pagination/table-pagination';
import { TableRowActionsComponent } from '../../../shared/components/table/table-row-actions/table-row-actions';
import { TableCellHeaderComponent } from '../../../shared/components/table/table-cell-header/table-cell-header';
import { TableEmptyStateComponent } from '../../../shared/components/table/table-empty-state/table-empty-state';
import { ExcelImportModalComponent, ExcelColumnConfig } from '../../../shared/components/excel-import-modal/excel-import-modal';
import { TableComponent } from '../../../shared/components/table/table/table';
import { TableCellHeaderActionsComponent } from '../../../shared/components/table/table-cell-header-actions/table-cell-header-actions';
import { TableCellTextComponent } from '../../../shared/components/table/table-cell-text/table-cell-text';
import { TableHeaderFilterComponent } from '../../../shared/components/table/table-header-filter/table-header-filter';
import { TenantService } from '../services/tenant.service';
import { TenantListItemDto,  } from '../models/tenant-list-item.model';
import { TenantFilterState } from '../models/tenant-filter-state.model';
import { BulkCreateTenantCommand  } from '../models/bulk-create-tenant-item-data.model';
import { FilterCondition } from '../../../core/constants/filter-condition.enum'; 
import { TableCellDateTimeComponent } from "../../../shared/components/table/table-cell-datetime/table-cell-datetime"; 
@Component({
  selector: 'app-tenant-list',
  templateUrl: './tenant-list.html', 
  standalone: true,
  imports: [
    FormsModule,
    TableToolbarComponent,
    TablePaginationComponent,
    TableRowActionsComponent,
    TableCellHeaderComponent,
    ExcelImportModalComponent,
    TableComponent,
    TableCellHeaderActionsComponent,
    TableCellTextComponent,
    TableHeaderFilterComponent,
    TableEmptyStateComponent,
    TableCellDateTimeComponent 
]
})
export class TenantListComponent extends BaseListDirective<TenantListItemDto, TenantFilterState> {

  protected service: IListService<TenantListItemDto> = inject(TenantService);
  protected override exportFileName = 'Firmalar_Listesi';
  protected override globalSearchFields = ['name','ModifiedByUser.FullName','CreatedByUser.FullName' ];
  protected override filterFieldConfigs: FilterFieldConfig[] = [
    { field: 'Name', valueKey: 'nameValue', conditionKey: 'nameCondition' },
    { field: 'RevNum', valueKey: 'revNumValue', conditionKey: 'revNumCondition' },
    { field: 'CreatedDate', valueKey: 'createdDateValue', conditionKey: 'createdDateCondition', value2Key: 'createdDateValue2' },
    { field: 'CreatedByUser.FullName', valueKey: 'createdUserFullNameValue', conditionKey: 'createdUserFullNameCondition'},
    { field: 'ModifiedDate', valueKey: 'modifiedDateValue', conditionKey: 'modifiedDateCondition', value2Key: 'modifiedDateValue2' },
    { field: 'ModifiedByUser.FullName', valueKey: 'modifiedUserFullNameValue', conditionKey: 'modifiedUserFullNameCondition'}
  
  
  ]; 
  isExcelModalOpen = signal<boolean>(false);

  override excelColumns: ExcelColumnConfig[] = [
    { headerKey: 'Title.Code', field: 'code' },
    { headerKey: 'Title.Tenant.Name', field: 'name' }, 
  ];
  constructor() {
    super();
    this.setInitialFilters({
      globalSearch: '',
      nameCondition: FilterCondition.Contains,
      nameValue: '',
      sortField: 'revnum',
      sortOrder: 'desc',
      revNumCondition: FilterCondition.Equals,
      revNumValue: null,
      createdDateCondition :FilterCondition.Equals,
      createdDateValue : null,
      createdDateValue2 : null,
      createdUserFullNameCondition: FilterCondition.Contains,
      createdUserFullNameValue: '',
      modifiedDateCondition :FilterCondition.Equals,
      modifiedDateValue : null,
      modifiedDateValue2 : null,
      modifiedUserFullNameCondition: FilterCondition.Contains,
      modifiedUserFullNameValue: '',
    });
  }  
  onDeleteTenant(id: string | number): void {
    this.onDelete(id);
  }
  onSetActiveTenant(id: string | number): void {
    this.onSetActive(id);
  }
  onBulkAction(): void {
    if (this.showPassived()) {
      //this.onBulkRestore();
      this.onBulkDelete();
    } else {
      this.onBulkDelete();
    }
  } 

  onBulkSetActiveRole(): void { 
      this.onBulkSetActive();
  } 
  onBulkSetPassiveRole(): void { 
      this.onBulkSetPassive();
  } 

  bulkCreate(data: any[], onSuccess: () => void, onError: () => void, onFinally: () => void): void {
  this.bulkCreateInternal(
    data,
    item => ({ code: item.code,name: item.name }),
    (mapped): BulkCreateTenantCommand  => ({ items: mapped }),
    () => { 
      onSuccess(); 
    },
    () => { 
      onError(); 
    },
    ()=>{
      onFinally();
    }
  );
}
  
}
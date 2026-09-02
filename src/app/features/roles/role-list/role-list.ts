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
import { RoleService } from '../services/role.service';
import { RoleListItemDto,  } from '../models/role-list-item.model';
import { RoleFilterState } from '../models/role-filter-state.model';
import { BulkCreateRoleCommand  } from '../models/bulk-create-role-item-data.model';
import { FilterCondition } from '../../../core/constants/filter-condition.enum'; 
import { TableCellDateTimeComponent } from "../../../shared/components/table/table-cell-datetime/table-cell-datetime"; 
import { RowAction } from '../../../shared/components/table/table-row-actions/table-row-action.model';
import { ToolbarAction } from '../../../shared/components/table/table-toolbar/table-toolbar-action.model';
@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.html', 
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
export class RoleListComponent extends BaseListDirective<RoleListItemDto, RoleFilterState> {

  protected service: IListService<RoleListItemDto> = inject(RoleService);
  protected override exportFileName = 'Roller_Listesi';
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
   // { headerKey: 'Title.Code', field: 'code' },
    { headerKey: 'Title.Role.Name', field: 'name' }, 
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
  onDeleteRole(id: string | number): void {
    this.onDelete(id);
  }
  onSetActiveRole(id: string | number): void {
    this.onSetActive(id);
  }
  onBulkDeleteRole(): void {
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
 
  rowExtraActions(row: RoleListItemDto): RowAction[] {
  return [
   // { icon: 'bi-shield-lock', label: 'Label.ActionAuthorize', routerLink: ['/role-permission/form', row.id] },
    { icon: 'bi-magic',       label: 'Label.AuthorizeWizard', routerLink: ['/role-permission-wizard', row.id] },
   ];
}
  bulkCreate(data: any[], onSuccess: () => void, onError: () => void, onFinally: () => void): void {
  this.bulkCreateInternal(
    data,
    item => ({ code: item.code,name: item.name }),
    (mapped): BulkCreateRoleCommand  => ({ items: mapped }),
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
  
  toolbarExtraActions: ToolbarAction[] = [
    {
      tooltipText: 'Button.BulkAssignPermissions',
      icon: 'bi-shield-plus',
      variantClass: 'btn-manage-perms',
      routerLink: ['/roles/role-multi-permission-wizard'],
      visible: () => this.perms.update  // opsiyonel; vermezsen hep görünür
    }
  ];
}
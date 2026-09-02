import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseListDirective } from '../../../shared/directives/base-list.directive';
import { FilterFieldConfig, IListService } from '../../../shared/models/list-config.model';
import { TableToolbarComponent } from '../../../shared/components/table/table-toolbar/table-toolbar';
import { TablePaginationComponent } from '../../../shared/components/table/table-pagination/table-pagination';
import { TableRowActionsComponent } from '../../../shared/components/table/table-row-actions/table-row-actions';
import { RowAction } from '../../../shared/components/table/table-row-actions/table-row-action.model';
import { TableCellHeaderComponent } from '../../../shared/components/table/table-cell-header/table-cell-header';
import { TableEmptyStateComponent } from '../../../shared/components/table/table-empty-state/table-empty-state';
import { ExcelImportModalComponent, ExcelColumnConfig } from '../../../shared/components/excel-import-modal/excel-import-modal';
import { TableComponent } from '../../../shared/components/table/table/table';
import { TableCellHeaderActionsComponent } from '../../../shared/components/table/table-cell-header-actions/table-cell-header-actions';
import { TableCellTextComponent } from '../../../shared/components/table/table-cell-text/table-cell-text';
import { TableCellDateTimeComponent } from '../../../shared/components/table/table-cell-datetime/table-cell-datetime';
import { TableHeaderFilterComponent } from '../../../shared/components/table/table-header-filter/table-header-filter';
import { UserService } from '../services/user.service';
import { UserListItemDto } from '../models/user-list-item.model';
import { UserFilterState } from '../models/user-filter-state.model';
import { BulkCreateAppUserCommand } from '../models/bulk-create-user-item-data.model';
import { FilterCondition } from '../../../core/constants/filter-condition.enum';
import { ToolbarAction } from '../../../shared/components/table/table-toolbar/table-toolbar-action.model';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.html',
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
export class UserListComponent extends BaseListDirective<UserListItemDto, UserFilterState> {
  protected service: IListService<UserListItemDto> = inject(UserService);
  protected override exportFileName = 'Kullanicilar_Listesi';
  protected override globalSearchFields = ['firstName', 'lastName', 'email', 'ModifiedByUser.FullName', 'CreatedByUser.FullName'];
  protected override filterFieldConfigs: FilterFieldConfig[] = [
    { field: 'FirstName', valueKey: 'firstNameValue', conditionKey: 'firstNameCondition' },
    { field: 'LastName', valueKey: 'lastNameValue', conditionKey: 'lastNameCondition' },
    { field: 'Email', valueKey: 'emailValue', conditionKey: 'emailCondition' },
    { field: 'RevNum', valueKey: 'revNumValue', conditionKey: 'revNumCondition' },
    { field: 'CreatedDate', valueKey: 'createdDateValue', conditionKey: 'createdDateCondition', value2Key: 'createdDateValue2' },
    { field: 'CreatedByUser.FullName', valueKey: 'createdUserFullNameValue', conditionKey: 'createdUserFullNameCondition' },
    { field: 'ModifiedDate', valueKey: 'modifiedDateValue', conditionKey: 'modifiedDateCondition', value2Key: 'modifiedDateValue2' },
    { field: 'ModifiedByUser.FullName', valueKey: 'modifiedUserFullNameValue', conditionKey: 'modifiedUserFullNameCondition' }
  ];

  isExcelModalOpen = signal<boolean>(false);

  override excelColumns: ExcelColumnConfig[] = [
    { headerKey: 'Title.User.FirstName', field: 'firstName' },
    { headerKey: 'Title.User.LastName', field: 'lastName' },
    { headerKey: 'Title.User.Email', field: 'email' }
  ];

  constructor() {
    super();
    this.setInitialFilters({
      globalSearch: '',
      firstNameCondition: FilterCondition.Contains,
      firstNameValue: '',
      lastNameCondition: FilterCondition.Contains,
      lastNameValue: '',
      emailCondition: FilterCondition.Contains,
      emailValue: '',
      sortField: 'revnum',
      sortOrder: 'desc',
      revNumCondition: FilterCondition.Equals,
      revNumValue: null,
      createdDateCondition: FilterCondition.Equals,
      createdDateValue: null,
      createdDateValue2: null,
      createdUserFullNameCondition: FilterCondition.Contains,
      createdUserFullNameValue: '',
      modifiedDateCondition: FilterCondition.Equals,
      modifiedDateValue: null,
      modifiedDateValue2: null,
      modifiedUserFullNameCondition: FilterCondition.Contains,
      modifiedUserFullNameValue: ''
    });
  }

  onDeleteUser(id: string | number): void {
    this.onDelete(id);
  }

  onSetActiveUser(id: string | number): void {
    this.onSetActive(id);
  }

  onBulkSetActiveRole(): void { 
      this.onBulkSetActive();
  } 
  onBulkSetPassiveRole(): void { 
      this.onBulkSetPassive();
  } 
  onBulkAction(): void {
    if (this.showPassived()) {
      // this.onBulkRestore();
      this.onBulkDelete();
    } else {
      this.onBulkDelete();
    }
  }

  bulkCreate(data: any[], onSuccess: () => void, onError: () => void, onFinally: () => void): void {
    this.bulkCreateInternal(
      data,
      item => ({ firstName: item.firstName, lastName: item.lastName, email: item.email }),
      (mapped): BulkCreateAppUserCommand => ({ items: mapped }),
      () => { onSuccess(); },
      () => { onError(); },
      () => { onFinally(); }
    );
  }

  // Satir bazli ekstra aksiyon: kullaniciyi yetkilendirme ekranina yonlendirir.
  // table-row-actions dropdown'inda "Yetkilendir" satiri olarak render edilir.
 rowExtraActions(row: UserListItemDto): RowAction[] {
  return [
   // { icon: 'bi-shield-lock', label: 'Label.ActionAuthorize', routerLink: ['/user-permisson/form', row.id] },
    { icon: 'bi-magic',       label: 'Label.AuthorizeWizard', routerLink: ['/user-permission-wizard', row.id] }
  ];
}
toolbarExtraActions: ToolbarAction[] = [
  {
    tooltipText: 'Button.BulkAssignPermissions',
    icon: 'bi-shield-plus',
    variantClass: 'btn-manage-perms',
    routerLink: ['/users/user-multi-permission-wizard'],
    visible: () => this.perms.update  // opsiyonel; vermezsen hep görünür
  }
];
}
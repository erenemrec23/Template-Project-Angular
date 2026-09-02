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
import { TableHeaderFilterComponent } from '../../../shared/components/table/table-header-filter/table-header-filter';
import { QrLocationService } from '../services/qr-location.service';
import { QrLocationListItemDto } from '../models/qr-location-list-item.model';
import { QrLocationFilterState } from '../models/qr-location-filter-state.model';
import { BulkCreateQrLocationCommand } from '../models/bulk-create-qr-location-item-data.model';
import { FilterCondition } from '../../../core/constants/filter-condition.enum';
import { TableCellDateTimeComponent } from "../../../shared/components/table/table-cell-datetime/table-cell-datetime";
import { QRCodeComponent } from 'angularx-qrcode';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-qr-location-list',
  templateUrl: './qr-location-list.html',
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
    TableCellDateTimeComponent,
    QRCodeComponent,
    ModalComponent,
    TranslatePipe
]
})
export class QrLocationListComponent extends BaseListDirective<QrLocationListItemDto, QrLocationFilterState> {

  protected service: IListService<QrLocationListItemDto> = inject(QrLocationService);
  protected override exportFileName = 'QrLokasyonlar_Listesi';
  protected override globalSearchFields = ['name', 'locationName', 'ModifiedByUser.FullName', 'CreatedByUser.FullName'];
  protected override filterFieldConfigs: FilterFieldConfig[] = [
    { field: 'Name', valueKey: 'nameValue', conditionKey: 'nameCondition' },
    { field: 'StartDate', valueKey: 'startDateValue', conditionKey: 'startDateCondition', value2Key: 'startDateValue2' },
    { field: 'EndDate', valueKey: 'endDateValue', conditionKey: 'endDateCondition', value2Key: 'endDateValue2' },
    { field: 'LocationName', valueKey: 'locationNameValue', conditionKey: 'locationNameCondition' },
    { field: 'RevNum', valueKey: 'revNumValue', conditionKey: 'revNumCondition' },
    { field: 'CreatedDate', valueKey: 'createdDateValue', conditionKey: 'createdDateCondition', value2Key: 'createdDateValue2' },
    { field: 'CreatedByUser.FullName', valueKey: 'createdUserFullNameValue', conditionKey: 'createdUserFullNameCondition' },
    { field: 'ModifiedDate', valueKey: 'modifiedDateValue', conditionKey: 'modifiedDateCondition', value2Key: 'modifiedDateValue2' },
    { field: 'ModifiedByUser.FullName', valueKey: 'modifiedUserFullNameValue', conditionKey: 'modifiedUserFullNameCondition' }
  ];
  isExcelModalOpen = signal<boolean>(false);

  override excelColumns: ExcelColumnConfig[] = [
    { headerKey: 'Title.Code', field: 'code' },
    { headerKey: 'Title.QrLocation.Name', field: 'name' },
    { headerKey: 'Title.QrLocation.StartDate', field: 'startDate' },
    { headerKey: 'Title.QrLocation.EndDate', field: 'endDate' },
    { headerKey: 'Title.QrLocation.LocationName', field: 'locationName' },
  ];
  constructor() {
    super();
    this.setInitialFilters({
      globalSearch: '',
      nameCondition: FilterCondition.Contains,
      nameValue: '',
      sortField: 'revnum',
      sortOrder: 'desc',
      startDateCondition: FilterCondition.Equals,
      startDateValue: null,
      startDateValue2: null,
      endDateCondition: FilterCondition.Equals,
      endDateValue: null,
      endDateValue2: null,
      locationNameCondition: FilterCondition.Contains,
      locationNameValue: '',
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
      modifiedUserFullNameValue: '',
    });
  }
  onDeleteQrLocation(id: string | number): void {
    this.onDelete(id);
  }
  onSetActiveQrLocation(id: string | number): void {
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
      item => ({
        code: item.code,
        name: item.name,
        startDate: item.startDate,
        endDate: item.endDate,
        locationName: item.locationName
      }),
      (mapped): BulkCreateQrLocationCommand => ({ items: mapped }),
      () => {
        onSuccess();
      },
      () => {
        onError();
      },
      () => {
        onFinally();
      }
    );
  }

  // --- Satır bazlı ekstra aksiyonlar: QR Kodu Göster ---
  rowExtraActions(qrLocation: QrLocationListItemDto): RowAction[] {
    return [
      {
        icon: 'bi-qr-code',                 // sablon 'bi' prefix'ini kendi ekliyor
        label: 'Label.ShowQr',              // translate key: LocalizationFiles'a eklenmeli
        onClick: () => this.openQrModal(qrLocation.id)
      }
    ];
  }

  // --- QR modal state + aksiyonları (eski liste versiyonundan taşındı) ---
  isModalOpen = signal<boolean>(false);
  qrCodeUrl = signal<string>('');

  openQrModal(id: string | undefined): void {
    const baseUrl = window.location.origin;
    // NOT: Tarama URL'ini kendi rotanıza göre uyarlayın (eski versiyonda ?carId= idi).
    this.qrCodeUrl.set(`${baseUrl}/?qrLocationId=${id}`);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  printQr(): void {
    const printArea = document.getElementById('printable-qr');
    if (!printArea) return;

    const printWindow = window.open('', '_blank', 'width=600,height=600');

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Kod</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                margin-top: 50px;
              }
              h3 { color: #333; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${printArea.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
    }
  }

}
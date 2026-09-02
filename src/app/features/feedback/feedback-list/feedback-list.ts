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
import { TableCellDateTimeComponent } from '../../../shared/components/table/table-cell-datetime/table-cell-datetime';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '@ngx-translate/core';

import { FeedbackService } from '../services/feedback.service';
import { FeedbackListItemDto, FeedbackStatus, FeedbackCommentDto } from '../models/feedback-list-item.model';
import { FeedbackFilterState } from '../models/feedback-filter-state.model';
import { BulkCreateFeedbackCommand } from '../models/bulk-create-feedback-item-data.model';
import { FilterCondition } from '../../../core/constants/filter-condition.enum';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-feedback-list',
  templateUrl: './feedback-list.html',
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
    ModalComponent,
    TranslatePipe,
    DatePipe
  ]
})
export class FeedbackListComponent extends BaseListDirective<FeedbackListItemDto, FeedbackFilterState> {
  protected service: IListService<FeedbackListItemDto> = inject(FeedbackService);
  private feedbackService = inject(FeedbackService);

  protected override exportFileName = 'GeriBildirimler_Listesi';
  protected override globalSearchFields = ['comment', 'pageUrl', 'creatorEmail'];
  
  protected override filterFieldConfigs: FilterFieldConfig[] = [
    { field: 'Comment', valueKey: 'commentValue', conditionKey: 'commentCondition' },
    { field: 'PageUrl', valueKey: 'pageUrlValue', conditionKey: 'pageUrlCondition' },
    { field: 'CreatorEmail', valueKey: 'creatorEmailValue', conditionKey: 'creatorEmailCondition' },
    { field: 'Status', valueKey: 'statusValue', conditionKey: 'statusCondition' },
    { field: 'CreatedDate', valueKey: 'createdDateValue', conditionKey: 'createdDateCondition', value2Key: 'createdDateValue2' },
  ];

  isExcelModalOpen = signal<boolean>(false);
  readonly FeedbackStatus = FeedbackStatus;

  override excelColumns: ExcelColumnConfig[] = [
    { headerKey: 'Label.Comment', field: 'comment' },
    { headerKey: 'Label.PageUrl', field: 'pageUrl' },
    { headerKey: 'Label.CreatedUserFullName', field: 'creatorEmail' },
  ];

  // Modal State
  isImageModalOpen = signal<boolean>(false);
  selectedImage = signal<string>('');

  isDetailModalOpen = signal<boolean>(false);
  selectedFeedback = signal<FeedbackListItemDto | null>(null);
  comments = signal<FeedbackCommentDto[]>([]);
  newMessage = signal<string>('');
  isSendingComment = signal<boolean>(false);

  constructor() {
    super();
    this.setInitialFilters({
      globalSearch: '',
      commentCondition: FilterCondition.Contains,
      commentValue: '',
      pageUrlCondition: FilterCondition.Contains,
      pageUrlValue: '',
      creatorEmailCondition: FilterCondition.Contains,
      creatorEmailValue: '',
      statusCondition: FilterCondition.Equals,
      statusValue: null,
      sortField: 'createdDate',
      sortOrder: 'desc',
      createdDateCondition: FilterCondition.Equals,
      createdDateValue: null,
      createdDateValue2: null,
    });
  }

  onDeleteFeedback(id: string | number): void { this.onDelete(id); }
  onSetActiveFeedback(id: string | number): void { this.onSetActive(id); }

  onBulkAction(): void {
    if (this.showPassived()) {
      this.onBulkDelete();
    } else {
      this.onBulkDelete();
    }
  }

  onBulkSetActiveRole(): void { this.onBulkSetActive(); }
  onBulkSetPassiveRole(): void { this.onBulkSetPassive(); }

  bulkCreate(data: any[], onSuccess: () => void, onError: () => void, onFinally: () => void): void {
    this.bulkCreateInternal(
      data,
      item => ({ comment: item.comment, pageUrl: item.pageUrl, creatorEmail: item.creatorEmail }),
      (mapped): BulkCreateFeedbackCommand => ({ items: mapped }),
      onSuccess,
      onError,
      onFinally
    );
  }

  rowExtraActions(feedback: FeedbackListItemDto): RowAction[] {
    return [
      //{
      //  icon: 'bi-chat-left-text',
      //  label: 'Label.DetailAndComments',
      //  onClick: () => this.openDetailModal(feedback)
      //},
      {
        icon: 'bi-check-circle',
        label: 'Label.MarkAsCompleted',
        onClick: () => this.updateStatus(feedback.id!, FeedbackStatus.Completed)
      }
    ];
  }

  // --- Görsel Modal ---
  openImageModal(imagePath?: string): void {
    if (!imagePath) return;
    this.selectedImage.set(imagePath);
    this.isImageModalOpen.set(true);
  }

  // --- Detay & Yorum Modal ---
  openDetailModal(feedback: FeedbackListItemDto): void {
    this.selectedFeedback.set(feedback);
    this.isDetailModalOpen.set(true);
    this.loadComments(feedback.id!);
  }

  loadComments(feedbackId: string): void {
    this.feedbackService.getComments(feedbackId).subscribe(res => {
      if (res.isSuccess && res.value) {
        this.comments.set(res.value);
      }
    });
  }

  sendComment(): void {
    const fb = this.selectedFeedback();
    if (!fb?.id || !this.newMessage().trim() || this.isSendingComment()) return;

    this.isSendingComment.set(true);
    this.feedbackService.addComment(fb.id, this.newMessage().trim()).subscribe({
      next: (res) => {
        this.isSendingComment.set(false);
        if (res.isSuccess) {
          this.toast.success(this.t('Messages.CommentAddedSuccess') || 'Yorum eklendi');
          this.newMessage.set('');
          this.loadComments(fb.id!);
        }
      },
      error: () => this.isSendingComment.set(false)
    });
  }

  updateStatus(id: string, status: FeedbackStatus): void {
    this.feedbackService.updateStatus(id, status).subscribe(res => {
      if (res.isSuccess) {
        this.toast.success(this.t('Messages.StatusUpdatedSuccess') || 'Durum güncellendi');
        this.loadData();
      }
    });
  }
}
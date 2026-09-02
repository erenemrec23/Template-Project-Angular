import { BaseListItemDto } from '../../../shared/models/base-list-item.model';

export enum FeedbackStatus {
  Pending = 1,
  InProgress = 2,
  Completed = 3
}

export interface FeedbackCommentDto {
  id: string;
  message: string;
  senderFullName: string;
  isAdminResponse: boolean;
  createdDate: string;
}

export interface FeedbackListItemDto extends BaseListItemDto {
  id?: string;
  comment: string;
  screenshotPath?: string;
  pageUrl: string;
  status: FeedbackStatus;
  creatorEmail?: string;
  comments?: FeedbackCommentDto[];
  rowVersion?: string;
}
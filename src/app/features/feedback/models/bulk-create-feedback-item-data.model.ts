import { FeedbackListItemDto } from './feedback-list-item.model';

export interface BulkCreateFeedbackCommand {
  items: Partial<FeedbackListItemDto>[];
}
import { Injectable  } from '@angular/core';
import { Observable, from } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud.service';
import { FeedbackListItemDto, FeedbackCommentDto } from '../models/feedback-list-item.model';
import { BulkCreateFeedbackCommand } from '../models/bulk-create-feedback-item-data.model';
import { Result } from '../../../shared/models/results/result.model';
import { FeedbackData } from '../../../features/feedback/feedback-modal/feedback-modal'; 
import { switchMap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class FeedbackService extends BaseCrudService<
  FeedbackListItemDto,
  FeedbackListItemDto,
  FeedbackListItemDto,
  FeedbackListItemDto,
  BulkCreateFeedbackCommand
> {
  protected readonly baseUrl = 'FeedBacks';

  
  
  updateStatus(id: string, status: number): Observable<Result<any>> {
    var data = { id, status };
    return this.put<Result<any>>(`${this.baseUrl}/UpdateStatus`, data);
  }

  // Yorumları Getir
  getComments(feedbackId: string): Observable<Result<FeedbackCommentDto[]>> {
    return this.get<Result<FeedbackCommentDto[]>>(`${this.baseUrl}/${feedbackId}/comments`);
  }

  // Yeni Yorum Ekle
  addComment(feedbackId: string, message: string): Observable<Result<string>> {
    return this.post<Result<string>>(`${this.baseUrl}/${feedbackId}/comments`, { feedbackId, message });
  }
  
      
sendFeedback(data: FeedbackData): Observable<Result<string>> {
  // data URL → Blob (await yok, Observable zincirinde çözülür)
  return from(fetch(data.screenshotBase64).then(r => r.blob())).pipe(
    switchMap(blob => {
      const form = new FormData();
      form.append('comment', data.comment);
      form.append('pageUrl', data.pageUrl);
      form.append('screenshot', blob, 'screenshot.jpg');
      return this.post<Result<string>>(`${this.baseUrl}/create`, form);
    })
  );
}
}
    
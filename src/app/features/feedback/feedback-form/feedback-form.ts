import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { BaseFormDirective } from '../../../shared/directives/base-form.directive';
import { FormHeaderComponent } from '../../../shared/components/form/form-header/form-header';
import { FormInputComponent } from '../../../shared/components/form/form-input/form-input';
import { FormWrapperComponent } from '../../../shared/components/form/form/form';

import { FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormHeaderComponent,
    FormInputComponent,
    FormWrapperComponent
  ],
  templateUrl: './feedback-form.html'
})
export class FeedbackFormComponent extends BaseFormDirective {
  protected override getRedirectUrl(): string {
    return '/feedbacks';
  }
  private feedbackService = inject(FeedbackService);

  protected override initForm(): void {
    this.formGroup = this.fb.group({
      id: [null],
      comment: ['', [Validators.required]],
      pageUrl: ['', [Validators.required]],
      creatorEmail: [''],
      status: [1],
      rowVersion: ['']
    });
  }

  protected override getSaveObservable(formData: any): Observable<any> {
    return this.isEditMode()
      ? this.feedbackService.update(formData)
      : this.feedbackService.create(formData);
  }

  protected override loadEntityDetails(id: string): void {
    const request$ = this.isPassivedMode()
      ? this.feedbackService.getPassivedById(id)
      : this.feedbackService.getById(id);

    request$.subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.value) {
          this.formGroup.patchValue(response.value);
        }
      }
    });
  }
}
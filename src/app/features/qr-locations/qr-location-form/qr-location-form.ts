// src/app/features/qr-locations/qr-location-form/qr-location-form.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { BaseFormDirective } from '../../../shared/directives/base-form.directive';
import { FormHeaderComponent } from '../../../shared/components/form/form-header/form-header';
import { FormInputComponent } from '../../../shared/components/form/form-input/form-input';
import { FormWrapperComponent } from '../../../shared/components/form/form/form';

import { QrLocationService } from '../services/qr-location.service';

@Component({
  selector: 'app-qr-location-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormHeaderComponent,
    FormInputComponent,
    FormWrapperComponent
  ],
  templateUrl: './qr-location-form.html'
})
export class QrLocationFormComponent extends BaseFormDirective {
  protected override getRedirectUrl(): string {
    return '/qr-locations';
  }
  private qrLocationService = inject(QrLocationService);

  // 1. Form şemasını buraya özel kurgula
  protected override initForm(): void {
    this.formGroup = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      startDate: [null],
      endDate: [null],
      locationName: ['', [Validators.maxLength(200)]],
      rowVersion: ['']
    });
  }

  protected override getSaveObservable(formData: any): Observable<any> {
    return this.isEditMode()
      ? this.qrLocationService.update(formData)
      : this.qrLocationService.create(formData);
  }

  protected override loadEntityDetails(id: string): void {
    const request$ = this.isPassivedMode()
      ? this.qrLocationService.getPassivedById(id)
      : this.qrLocationService.getById(id);

    request$.subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.value) {
          this.formGroup.patchValue(response.value);
        }
      }
    });
  }
}

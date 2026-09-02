import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormCancelButtonComponent } from '../form-cancel-button/form-cancel-button';
import { FormSubmitButtonComponent } from '../form-submit-button/form-submit-button';

@Component({
  selector: 'form[app-form-wrapper]',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormCancelButtonComponent, FormSubmitButtonComponent],
  templateUrl: './form.html',
  // :host CSS bağımlılığını tamamen ortadan kaldıran Tailwind host binding
  host: {
    'class': 'block w-full'
  }
})
export class FormWrapperComponent {
  // Angular 21 Modern Signal Inputs
  
  readonly = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  cancelUrl = input<string>('/');
  isSubmitting = input<boolean>(false);
  submitButtonText = input<string>('Kaydet');
  onCancel = output<void>();
  oncancelClick() {
    this.onCancel.emit();
  }
}
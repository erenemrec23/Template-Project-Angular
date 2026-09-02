// src/app/features/tenant/tenant-form/tenant-form.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs'; 
import { BaseFormDirective } from '../../../shared/directives/base-form.directive'; 
import { FormHeaderComponent } from '../../../shared/components/form/form-header/form-header';
import { FormInputComponent } from '../../../shared/components/form/form-input/form-input';
import { FormWrapperComponent } from '../../../shared/components/form/form/form';

import { TenantService } from '../services/tenant.service';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormHeaderComponent,
    FormInputComponent,
    FormWrapperComponent
  ],
  templateUrl: './tenant-form.html'
})
export class TenantFormComponent extends BaseFormDirective {
  protected override getRedirectUrl(): string {
    return '/tenants';
  }
  private tenantService = inject(TenantService);

  // 1. Form şemasını buraya özel kurgula
  protected override initForm(): void {
    this.formGroup = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(250)]],
      rowVersion: ['']
    });
  }
 
  
 
  protected override getSaveObservable(formData: any): Observable<any> {
    return this.isEditMode()
      ? this.tenantService.update(formData)
      : this.tenantService.create(formData);
  }
 
  protected override loadEntityDetails(id: string): void {
     const request$ = this.isPassivedMode()
    ? this.tenantService.getPassivedById(id)
    : this.tenantService.getById(id);

  request$.subscribe({
    next: (response) => {
      if (response && response.isSuccess && response.value) {
        this.formGroup.patchValue(response.value);
      }
    }
  });
  }
}
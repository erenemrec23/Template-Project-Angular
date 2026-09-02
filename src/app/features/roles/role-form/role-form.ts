import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs'; 
import { BaseFormDirective } from '../../../shared/directives/base-form.directive';
import { FormHeaderComponent } from '../../../shared/components/form/form-header/form-header';
import { FormInputComponent } from '../../../shared/components/form/form-input/form-input';
import { FormWrapperComponent } from '../../../shared/components/form/form/form';
import { PermissionMatrixComponent } from '../../../shared/components/permission-matrix/permission-matrix';
import { RolePersonnelSelectComponent } from '../../../shared/components/role-personnel-select/role-personnel-select';
import { UserListItemDto, UserLookUpListItemDto } from '../../users/models/user-list-item.model';
import { RoleService } from '../services/role.service'; 
import { UserService } from '../../users/services/user.service';
import { Result } from '../../../shared/models/results/result.model'
import { UpdateRoleCommand }  from '../../role-permissions/models/role-permission-item.model'
import { TabContainerComponent } from '../../../shared/components/tab/tab';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormHeaderComponent,
    FormInputComponent,
    FormWrapperComponent,
    PermissionMatrixComponent,
    RolePersonnelSelectComponent,
    TabContainerComponent   
  ],
  templateUrl: './role-form.html'
})
export class RoleFormComponent extends BaseFormDirective {
 
  protected override getRedirectUrl(): string {
    return '/roles';
  }

  private roleService = inject(RoleService); 
  private userService = inject(UserService);

  activeTab = signal<string>('general');
  private calculatedRolePermissions: any[] = [];
  private calculatedGroupPermissions: any[] = [];
  private calculatedPersonnelIds: string[] = [];
 
 rolePermissionFetchFn = (id: string) => this.roleService.getAssignedPermissions(id);
 rolePersonnelFetchAllFn = (): Observable<Result<UserLookUpListItemDto[]>> => this.userService.getLookUpList();
rolePersonnelFetchAssignedFn = (id: string) => this.roleService.getAssignedPersonnelIds(id);

rolePersonnelLabelFn = (user: UserListItemDto): string => user.fullName; 

 


  protected override initForm(): void {
    this.formGroup = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(250)]],
      rowVersion: ['']
    });
  }

  onPermissionsCalculated(permissions: any[]): void {
    this.calculatedRolePermissions = permissions;
  }
    onGroupPermissionsCalculated(permissions: any[]): void { 
    this.calculatedGroupPermissions = permissions;
  }

  onPersonnelCalculated(userIds: string[]): void {
    this.calculatedPersonnelIds = userIds;
  }
  
   
  protected override getSaveObservable(formData: any): Observable<any> {
     const allPermissions = [
      ...this.calculatedRolePermissions,
      ...this.calculatedGroupPermissions
    ];
  const command: UpdateRoleCommand  = {
    ...formData,                               
    permissions: allPermissions,
    userIds: this.calculatedPersonnelIds
  };
  return this.isEditMode()
    ? this.roleService.update(command)
    : this.roleService.create(command);
}
  protected override loadEntityDetails(id: string): void {
    const request$ = this.isPassivedMode()
      ? this.roleService.getPassivedById(id)
      : this.roleService.getById(id);

    request$.subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.value) {
          this.formGroup.patchValue(response.value);
        }
      }
    });
  }
}
// src/app/features/users/user-permissions-form/user-permissions-form.component.ts
import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserPermissionService } from '../services/user-permission.service';
import { UserLookUpListItemDto } from '../../users/models/user-list-item.model';
import { UpdateUserPermissionsCommand } from '../models/update-user-permission-command.model';
import { UserService } from '../../users/services/user.service';
import { SelectComponent } from '../../../shared/components/user-select/select';
import { PermissionMatrixComponent } from '../../../shared/components/permission-matrix/permission-matrix';
import { FormWrapperComponent } from '../../../shared/components/form/form/form';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmService, ConfirmOptions } from '../../../shared/components/confirm/services/confirm.service';

// Bu form sayfa yetkilerini yönetir → Scope = Page (1).
// Böylece kaydetme yalnızca sayfa satırlarını full-replace eder;
// wizard modül modundan verilmiş grup grant'ları silinmez.
const PAGE_SCOPE = 1;

@Component({
  selector: 'app-user-permissions-form',
  standalone: true,
  imports: [ReactiveFormsModule, SelectComponent, PermissionMatrixComponent, FormWrapperComponent],
  templateUrl: './user-permission-form.html'
})
export class UserPermissionsFormComponent implements OnInit {

  userPermissionFetchFn = (id: string) => this.userPermissionService.GetListByUserId(id);

  @Input() confirmOptions: ConfirmOptions = {};

  private fb = inject(FormBuilder);
  private userPermissionService = inject(UserPermissionService);
  private translate = inject(TranslateService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute); 
  private router = inject(Router);
  private confirmService = inject(ConfirmService);

  usersList = signal<UserLookUpListItemDto[]>([]);
  permissionForm!: FormGroup;
  isSubmitting = signal<boolean>(false);

  // Matristen gelecek hazır sayfa-yetki listesi

  ngOnInit(): void {
    this.buildForm();
    this.loadUsersAndSelectQueryParam();
  }

  t(key: string): string {
    return this.translate.instant(key);
  }

  private buildForm(): void {
    // Form yalnızca userId tutar; yetkiler matristen gelir
    this.permissionForm = this.fb.group({
      userId: ['', Validators.required]
    });
  }

  private loadUsersAndSelectQueryParam(): void {
    this.userService.getLookUpList().subscribe((res) => {
      if (res.isSuccess) {
        this.usersList.set(res.value);
        this.checkRouteParamsAndSetUser();
      }
    });
  }

  private checkRouteParamsAndSetUser(): void {
    let idFromUrl = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('id');
    if (!idFromUrl) {
      idFromUrl = this.route.snapshot.queryParamMap.get('id');
    }

    if (idFromUrl) {
      const userExists = this.usersList().some(user => user.id === idFromUrl);
      if (userExists) {
        this.permissionForm.patchValue({ userId: idFromUrl });
      }
    }
  }
  
  private calculatedPagePermissions: any[] = [];
  private calculatedGroupPermissions: any[] = [];

  // Sayfa yetkileri değiştiğinde
  onPermissionsCalculated(permissions: any[]): void {
    // Backend DTO'suna uygun şekilde Map ederiz: { pageName: '...', permissionValue: ... }
    this.calculatedPagePermissions = permissions.filter(p => p.permissionValue > 0);
  }

  // Modül yetkileri değiştiğinde (YENİ)
  onGroupPermissionsCalculated(permissions: any[]): void { 
    this.calculatedGroupPermissions = permissions.filter(p => p.permissionValue > 0);
  }

  async onSubmit(): Promise<void> {
    if (this.permissionForm.invalid) return;

    const result = await this.confirmService.open(this.confirmOptions);
    if (!result) return;

    this.isSubmitting.set(true);

    // Hem sayfa hem grup izinlerini tek bir listede birleştiriyoruz
    const allPermissions = [
      ...this.calculatedPagePermissions,
      ...this.calculatedGroupPermissions
    ];
 

    // Eğer backend tüm yetki tiplerini birlikte kabul ediyorsa Scope gönderme biçiminizi 
    // backend mimarinize göre ayarlayın (Örn: Modül için 2, Sayfa için 1 veya karma kayıtsa Scope = 0 / Nullable)
    const command: UpdateUserPermissionsCommand = {
      userId: this.permissionForm.value.userId,
      permissions: allPermissions
    };

    this.userPermissionService.updateUserPermissions(command).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.isSuccess) {
          this.router.navigate(['/users'], {
            state: {
              toast: {
                type: 'success',
                message: this.t('Messages.PermissionsUpdatedSuccess') || 'Yetkiler başarıyla güncellendi.'
              }
            }
          });
        }
      },
      error: () => this.isSubmitting.set(false)
    });
  }
}
 
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { BaseFormDirective } from '../../../shared/directives/base-form.directive';
import { FormHeaderComponent } from '../../../shared/components/form/form-header/form-header';
import { FormInputComponent } from '../../../shared/components/form/form-input/form-input';
import { FormWrapperComponent } from '../../../shared/components/form/form/form';
import { PermissionMatrixComponent } from '../../../shared/components/permission-matrix/permission-matrix';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select';
import { TabContainerComponent } from '../../../shared/components/tab/tab';
import { UserService } from '../services/user.service';
import { UserPermissionService } from '../../user-permissions/services/user-permission.service';
import { RoleService } from '../../roles/services/role.service';
import { Result } from '../../../shared/models/results/result.model';
import { RoleLookUpListItemDto } from '../../roles/models/role-lookup-item.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormHeaderComponent,
    FormInputComponent,
    FormWrapperComponent,
    PermissionMatrixComponent,
    MultiSelectComponent,
    TabContainerComponent
  ],
  templateUrl: './user-form.html'
})
export class UserFormComponent extends BaseFormDirective {


twoFactorEnabled = signal<boolean>(false);
disabling2fa = signal<boolean>(false);

  protected override getRedirectUrl(): string {
    return '/users';
  }

  private userService = inject(UserService); 
  private userPermissionService = inject(UserPermissionService);
  private roleService = inject(RoleService);

  activeTab = signal<string>('general');

  showPassword = false;
  isCopied = false;
 
  private calculatedPagePermissions: any[] = [];
  private calculatedGroupPermissions: any[] = [];
  // Roller sekmesinden gelen secili rol id'leri
  private calculatedRoleIds: string[] = [];

  // permission-matrix: kullanicinin mevcut yetkilerini ceker
  userPermissionFetchFn = (id: string) => this.userPermissionService.GetListByUserId(id);

  // assignment-select (roller): tum roller (lookup) + kullaniciya atanmis rol id'leri
  roleLookupFetchAllFn = (): Observable<Result<RoleLookUpListItemDto[]>> => this.roleService.getLookUpList();
  roleAssignedFetchFn = (id: string) => this.userService.getAssignedRoleIds(id);
  roleLabelFn = (role: RoleLookUpListItemDto): string => role.name;

  protected override initForm(): void {
    // Identity konfigurasyonunuza birebir paralel validator:
    // En az 6 karakter + En az 1 Rakam (?=.*[0-9])
    console.log("this.isEditMode()", this.isEditMode());
    const passwordValidators = this.isEditMode()
      ? null
      : [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[0-9]).*$/)
        ];

    this.formGroup = this.fb.group({
      id: [null],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(250)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(250)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', passwordValidators],
      rowVersion: ['']
    });
  }

  // --- Yetki matrisi olaylari (role-form ile ayni) ---
  onPermissionsCalculated(permissions: any[]): void {
    this.calculatedPagePermissions = permissions;
  }

  onGroupPermissionsCalculated(permissions: any[]): void {
    this.calculatedGroupPermissions = permissions;
  }

  // --- Roller sekmesi ---
  onRolesCalculated(roleIds: string[]): void {
    this.calculatedRoleIds = roleIds;
  }

  /**
   * Identity kurallarina uygun rastgele sifre uretir (En az 6 karakter, 1 Rakam, 1 Buyuk Harf).
   */
  generatePassword(length = 10): void {
    if (length < 6) {
      length = 6;
    }

    const charset = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      digits: '0123456789'
    };

    const allChars = charset.lower + charset.upper + charset.digits;

    // Identity sartlarini garantiye aliyoruz:
    const passwordChars: string[] = [
      this.getRandomChar(charset.digits), // RequiredDigit = true icin en az 1 rakam
      this.getRandomChar(charset.upper),  // Okunabilirlik ve standart icin 1 buyuk harf
      this.getRandomChar(charset.lower)   // 1 kucuk harf
    ];

    // Kalan uzunlugu alfisayisal (harf + rakam) karakterlerle doldur
    for (let i = passwordChars.length; i < length; i++) {
      passwordChars.push(this.getRandomChar(allChars));
    }

    // Karakterleri rastgele karistir
    const randomPassword = this.shuffleArray(passwordChars).join('');

    const passwordControl = this.formGroup.get('password');
    if (passwordControl) {
      passwordControl.setValue(randomPassword);
      passwordControl.markAsDirty();
      passwordControl.markAsTouched();
    }

    this.showPassword = true;
  }

  async copyPassword(): Promise<void> {
    const password = this.formGroup.get('password')?.value;
    if (password) {
      await navigator.clipboard.writeText(password);
      this.isCopied = true;
      setTimeout(() => (this.isCopied = false), 2000);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private getRandomChar(charSet: string): string {
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    return charSet[randomValues[0] % charSet.length];
  }

  private shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
      const randomValues = new Uint32Array(1);
      crypto.getRandomValues(randomValues);
      const j = randomValues[0] % (i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  protected override getSaveObservable(formData: any): Observable<any> {
    // role-form ile birebir: yetkiler + roller tek command icinde gider, tek istek.
    const allPermissions = [
      ...this.calculatedPagePermissions,
      ...this.calculatedGroupPermissions
    ];

    const command = {
      ...formData,
      permissions: allPermissions,
      roleIds: this.calculatedRoleIds
    };
 
   console.log("command", command); 
    return this.isEditMode()
      ? this.userService.update(command)
      : this.userService.create(command);
  }

  // alanlar 

// loadEntityDetails icindeki next bloguna ekle:
protected override loadEntityDetails(id: string): void {
  const request$ = this.isPassivedMode()
    ? this.userService.getPassivedById(id)
    : this.userService.getById(id);

  request$.subscribe({
    next: (response) => {
      if (response && response.isSuccess && response.value) {
        this.formGroup.patchValue(response.value);
        this.twoFactorEnabled.set(!!response.value.twoFactorEnabled); // <-- eklendi
      }
    }
  });
}

// 2FA kapat (formu submit etmeden, bagimsiz istek)
disableTwoFactor(): void {
  const id = this.formGroup.get('id')?.value;
  if (!id || !this.twoFactorEnabled()) return;

  this.disabling2fa.set(true);
  this.userService.disableTwoFactor(id).subscribe({
    next: (res) => {
      this.disabling2fa.set(false);
      if (res?.isSuccess) {
        this.twoFactorEnabled.set(false); // kart "kapali" durumuna geoer
      }
    },
    error: () => this.disabling2fa.set(false)
  });
}
}
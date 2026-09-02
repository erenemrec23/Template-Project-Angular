import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { PermissionWizardComponent } from '../../../shared/components/permission-wizard/permission-wizard';
import { UserPermissionService } from '../../user-permissions/services/user-permission.service';
import { UserService } from '../../users/services/user.service'; // YOL: kendi yapına göre doğrula
import { FormHeaderComponent } from '../../../shared/components/form/form-header/form-header';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Kullanıcı listesinden "toplu yetki atama" giriş sayfası.
 * targetId GEÇİLMEZ → wizard çoklu modda açılır: önce ÇOKLU KULLANICI seçimi, sonra modül/sayfa, sonra yetki.
 */
@Component({
  selector: 'app-user-permission-bulk',
  standalone: true,
  imports: [PermissionWizardComponent, FormHeaderComponent, TranslatePipe],
  templateUrl: './user-multi-permission-wizard.html',
})
export class UserPermissionBulkComponent {
  private router = inject(Router);
  private translate = inject(TranslateService);
  private svc = inject(UserPermissionService);
  private userSvc = inject(UserService);

  // Çoklu kullanıcı lookup'ı (fullName)
  fetchTargetsFn = () => this.userSvc.getLookUpList();
  targetLabelFn = (u: any) => u.fullName;

  // Seçilen her kullanıcı için mevcut tekli endpoint'e forkJoin
  saveFn = (ids: string[], permissions: any[], _scope: number) =>
    this.svc.updateUsersPermissions({ userIds: ids, permissions });

  onSaved() {
    this.router.navigate(['/users'], {
      state: { toast: { type: 'success', message: this.translate.instant('Messages.PermissionsUpdatedSuccess') } }
    });
  }
}
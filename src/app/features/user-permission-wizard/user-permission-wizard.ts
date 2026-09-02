import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PermissionWizardComponent } from '../../shared/components/permission-wizard/permission-wizard';
import { UserPermissionService } from '../user-permissions/services/user-permission.service';
import { UserService } from '../users/services/user.service'; // YOL: kendi yapına göre doğrula
import { FormHeaderComponent } from '../../shared/components/form/form-header/form-header';

@Component({
  selector: 'app-user-permission-wizard',
  standalone: true,
  imports: [PermissionWizardComponent, FormHeaderComponent],
  templateUrl: './user-permission-wizard.html',
})
export class UserPermissionWizardComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private svc = inject(UserPermissionService);
  private userSvc = inject(UserService);

  // Route'ta id VARSA tekli akış; YOKSA çoklu (personel seçimi) akışı
  userId = signal<string | null>(this.route.snapshot.paramMap.get('id'));

  // Tekli akış: mevcut yetkileri çek (merge için)
  fetchFn = (id: string) => this.svc.GetListByUserId(id);

  // Çoklu akış: tüm kullanıcı lookup'ı (personel çoklu seçimi) — app-multi-select'i besler
  fetchTargetsFn = () => this.userSvc.getLookUpList();
  targetLabelFn = (u: any) => u.fullName;

  // Yeni bulk endpoint: tek istekte tüm hedefler (tekli akış tek elemanlı dizi gönderir)
  saveFn = (ids: string[], permissions: any[], _scope: number) =>
    this.svc.updateUsersPermissions({ userIds: ids, permissions });

  onSaved() {
    this.router.navigate(['/users'], {
      state: { toast: { type: 'success', message: this.translate.instant('Messages.PermissionsUpdatedSuccess') } }
    });
  }
}
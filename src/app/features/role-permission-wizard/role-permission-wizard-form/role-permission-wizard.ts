import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PermissionWizardComponent } from '../../../shared/components/permission-wizard/permission-wizard';
import { RolePermissionService } from '../../role-permissions/services/role-permission.service';
import { RoleService } from '../../roles/services/role.service'; // YOL: kendi yapına göre doğrula
import { FormHeaderComponent } from '../../../shared/components/form/form-header/form-header';

@Component({
  selector: 'app-role-permission-wizard',
  standalone: true,
  imports: [PermissionWizardComponent, FormHeaderComponent],
  templateUrl: './role-permission-wizard.html',
})
export class RolePermissionWizardComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private svc = inject(RolePermissionService);
  private roleSvc = inject(RoleService);

  // Route'ta id VARSA tekli akış; YOKSA çoklu (rol seçimi) akışı
  roleId = signal<string | null>(this.route.snapshot.paramMap.get('id'));

  // Tekli akış: mevcut yetkileri çek (merge için)
  fetchFn = (id: string) => this.svc.GetListByRoleId(id);

  // Çoklu akış: tüm rol lookup'ı (DÜZ dizi olmalı — sayfalıysa .items açılmalı)
  fetchTargetsFn = () => this.roleSvc.getLookUpList();
  targetLabelFn = (r: any) => r.name;

  // Yeni bulk endpoint: tek istekte tüm hedefler (scope artık gerekmiyor — targeted sync)
  saveFn = (ids: string[], permissions: any[], _scope: number) =>
    this.svc.updateRolesPermissions({ roleIds: ids, permissions });

  onSaved() {
    this.router.navigate(['/roles'], {
      state: { toast: { type: 'success', message: this.translate.instant('Messages.PermissionsUpdatedSuccess') } }
    });
  }
}
import { Routes } from '@angular/router';
import { QrLocationFormComponent } from './features/qr-locations/qr-location-form/qr-location-form';
import { QrLocationListComponent } from './features/qr-locations/qr-location-list/qr-location-list';
import { LoginComponent } from './features/auth/login/login';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout';
import { UserListComponent } from './features/users/user-list/user-list';
import { UserFormComponent } from './features/users/user-form/user-form';
import { TenantListComponent } from './features/tenants/tenant-list/tenant-list';
import { TenantFormComponent } from './features/tenants/tenant-form/tenant-form';
import { UserPermissionsFormComponent } from './features/user-permissions/user-permisson-form/user-permission-form'
import { ForbiddenComponent } from './features/forbidden/forbidden'
import { RoleListComponent } from './features/roles/role-list/role-list';
import { RoleFormComponent } from './features/roles/role-form/role-form';
import { UserPermissionWizardComponent } from './features/user-permission-wizard/user-permission-wizard';
import { RolePermissionWizardComponent } from './features/role-permission-wizard/role-permission-wizard-form/role-permission-wizard';
import { RoleMultiPermissionWizardComponent } from './features/roles/role-multi-permission-wizard/role-multi-permission-wizard';
import { UserPermissionBulkComponent } from './features/users/user-multi-permission-wizard/user-multi-permission-wizard';
import { FeedbackListComponent } from './features/feedback/feedback-list/feedback-list'
import { FeedbackFormComponent } from './features/feedback/feedback-form/feedback-form'
import { FeedbackModalComponent } from './features/feedback/feedback-modal/feedback-modal';
export const routes: Routes = [
  // 1. Üst menüsü OLMAYAN rotalar (Login vb.)
  { path: 'login', component: LoginComponent },
{ path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent) },
{ path: 'reset-password',  loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPasswordComponent) },
  // 2. Üst menüsü OLAN ana sayfalar (Layout bileşeni üzerinden sarmalanır)
  {
    path: '',
    component: MainLayoutComponent, // Üst menü ve sidebar bu bileşenin içinde olur
    children: [
      { path: 'qr-locations', component: QrLocationListComponent },
      { path: 'qr-locations/form', component: QrLocationFormComponent },
      { path: 'qr-locations/form/:id', component: QrLocationFormComponent },
      { path: 'users', component: UserListComponent },
      { path: 'users/form', component: UserFormComponent  },
      { path: 'users/form/:id',  component: UserFormComponent },
      { path: 'users/user-multi-permission-wizard', component: UserPermissionBulkComponent },
      { path: 'tenants', component: TenantListComponent },
      { path: 'tenants/form', component: TenantFormComponent },
      { path: 'tenants/form/:id', component: TenantFormComponent },
      { path: 'user-permisson/form', component: UserPermissionsFormComponent },
      { path: 'user-permisson/form/:id', component: UserPermissionsFormComponent },
      { path: '403', component: ForbiddenComponent },
      { path: 'roles', component: RoleListComponent }, 
      { path: 'roles/form', component: RoleFormComponent }, 
      { path: 'roles/form/:id', component: RoleFormComponent }, 
      { path: 'roles/role-multi-permission-wizard', component: RoleMultiPermissionWizardComponent },
      { path: 'user-permission-wizard/:id', component: UserPermissionWizardComponent }, 
      { path: 'role-permission-wizard/:id', component: RolePermissionWizardComponent },
      { path:'page-permissions', loadComponent: () => import('./features/page-permission-management/page-permission-management-form/page-permission-management').then(m => m.PagePermissionManagementComponent) },
      { path: 'feedbacks', component: FeedbackListComponent },
      { path: 'feedbacks/form', component: FeedbackFormComponent }, 
      { path: 'feedbacks/form/:id', component: FeedbackFormComponent },  
      { path: 'feedbacks/form-modal', component: FeedbackModalComponent },  
      {
  path: 'permission-reports',
    loadComponent: () => import('./features/permission-report/permission-report.component')
    .then(m => m.PermissionReportComponent)
           //,data: { permission: 'PermissionReport.View' }
},
{ path: 'profile', loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent) }
    ],
    canActivate: [authGuard]
  }
];

// features/auth/reset-password/reset-password.ts
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  host: {
    'class': 'fixed inset-0 w-screen h-screen flex justify-center items-center bg-linear-to-br from-slate-50 to-slate-200/80 z-[99999]'
  }
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Sifirlama linkindeki query paramlar: /reset-password?email=...&token=...
  private email = this.route.snapshot.queryParamMap.get('email') ?? '';
  private token = this.route.snapshot.queryParamMap.get('token') ?? '';

  // Email + token yoksa link gecersiz say
  isLinkValid = signal<boolean>(!!this.email && !!this.token);

  resetForm: FormGroup = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: this.passwordsMatchValidator }
  );

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isDone = signal<boolean>(false);

  // Grup seviyesi dogrulama: iki sifre esit mi?
  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  isFieldInvalid(controlName: string): boolean {
    const ctrl = this.resetForm.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  get passwordMismatch(): boolean {
    return this.resetForm.hasError('passwordMismatch') &&
      !!this.resetForm.get('confirmPassword')?.touched;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.resetPassword({
      email: this.email,
      token: this.token,
      newPassword: this.resetForm.value.newPassword
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.isSuccess) {
          this.isDone.set(true);
          // Kisa bir bilgilendirmeden sonra login'e yonlendir
          setTimeout(() => this.router.navigate(['/login']), 2500);
        } else {
          this.errorMessage.set(res.error?.message || 'Şifre sıfırlanamadı. Bağlantı geçersiz veya süresi dolmuş olabilir.');
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Sistem hatası oluştu. Lütfen sonra tekrar deneyin.');
      }
    });
  }
}
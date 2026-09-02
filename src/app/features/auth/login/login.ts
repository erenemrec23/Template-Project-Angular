// features/auth/login/login.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  // CSS dosyasını tamamen ortadan kaldıran tam ekran ortalama host binding katmanı
  host: {
    'class': 'fixed inset-0 w-screen h-screen flex justify-center items-center bg-linear-to-br from-slate-50 to-slate-200/80 z-[99999]'
  }
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // mevcut alanların yanına
twoFactorStep = signal<boolean>(false);
pendingUserId = signal<string | null>(null);
twoFactorCode = signal<string>('');

onSubmit(): void {
  if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
  this.isSubmitting.set(true);
  this.errorMessage.set(null);

  this.authService.login(this.loginForm.value).subscribe({
    next: (res) => {
      this.isSubmitting.set(false);
      if (res.isSuccess && res.value?.requiresTwoFactor) {
        // Ikinci adima gec
        this.pendingUserId.set(res.value.userId);
        this.twoFactorStep.set(true);
      } else if (res.isSuccess && res.value?.token) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage.set(res.error?.message || 'E-posta veya şifre hatalı.');
      }
    },
    error: () => {
      this.isSubmitting.set(false);
      this.errorMessage.set('Sistem hatası oluştu. Lütfen sonra tekrar deneyin.');
    }
  });
}

verifyTwoFactor(): void {
  const userId = this.pendingUserId();
  const code = this.twoFactorCode().trim();
  if (!userId || code.length < 6) return;

  this.isSubmitting.set(true);
  this.errorMessage.set(null);

  this.authService.loginTwoFactor(userId, code).subscribe({
    next: (res) => {
      this.isSubmitting.set(false);
      if (res.isSuccess && res.value?.token) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage.set('Doğrulama kodu hatalı.');
      }
    },
    error: () => {
      this.isSubmitting.set(false);
      this.errorMessage.set('Doğrulama kodu hatalı.');
    }
  });
}

backToLogin(): void {
  this.twoFactorStep.set(false);
  this.pendingUserId.set(null);
  this.twoFactorCode.set('');
  this.errorMessage.set(null);
}

  loginForm: FormGroup = this.fb.group({
    userNameOrEmail: ['', [Validators.required]], // Kullanıcı adı da girilebileceği için email kısıtlamasını gevşettik
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Reaktif validasyon denetimlerini kolaylaştıran yardımcı metotlar
  isFieldInvalid(controlName: string): boolean {
    const ctrl = this.loginForm.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }
 
}
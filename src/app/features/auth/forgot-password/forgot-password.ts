// features/auth/forgot-password/forgot-password.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  // Login ile ayni: CSS dosyasi yerine tam ekran ortalama host binding'i
  host: {
    'class': 'fixed inset-0 w-screen h-screen flex justify-center items-center bg-linear-to-br from-slate-50 to-slate-200/80 z-[99999]'
  }
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isSent = signal<boolean>(false); // Bağlantı gönderildi ekranını göstermek için

  isFieldInvalid(controlName: string): boolean {
    const ctrl = this.forgotForm.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.isSuccess) {
          // Enumeration korumasi: backend kullanici olsa da olmasa da success donuyor.
          this.isSent.set(true);
        } else {
          this.errorMessage.set(res.error?.message || 'İşlem sırasında bir hata oluştu.');
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Sistem hatası oluştu. Lütfen sonra tekrar deneyin.');
      }
    });
  }
}
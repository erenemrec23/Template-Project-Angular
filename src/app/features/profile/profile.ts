import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { FormInputComponent } from '../../shared/components/form/form-input/form-input';
import { TabContainerComponent } from '../../shared/components/tab/tab';
import { QRCodeComponent } from 'angularx-qrcode'; 
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileService } from './services/profile.service';
import { TwoFactorSetupDto } from './models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, TabContainerComponent, QRCodeComponent, TranslatePipe],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);

  activeTab = signal<string>('general');

  // --- Genel bilgiler ---
  profileForm!: FormGroup;
  savingProfile = signal(false);

  // --- Sifre (ayri form) ---
  passwordForm!: FormGroup;
  changingPassword = signal(false);
  showCurrent = signal(false);
  showNew = signal(false);

  // --- 2FA ---
  twoFactorEnabled = signal(false);
  setup = signal<TwoFactorSetupDto | null>(null); // kurulum baslatildiysa dolu
  verifyCode = signal('');
  twoFactorBusy = signal(false);
  twoFactorError = signal<string | null>(null);

  passwordMismatch = computed(() =>
    this.passwordForm?.get('newPassword')?.value !== this.passwordForm?.get('confirmPassword')?.value
  );

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(250)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(250)]],
      email: ['', [Validators.required, Validators.email]]
    });

    // Identity kuralina paralel: min 6 + en az 1 rakam
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[0-9]).*$/)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: [this.matchValidator] });

    this.loadProfile();
  }

  private matchValidator(group: AbstractControl) {
    const p = group.get('newPassword')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { mismatch: true };
  }

  private loadProfile(): void {
    this.profileService.getProfile().subscribe(res => {
      if (res?.isSuccess && res.value) {
        this.profileForm.patchValue({
          firstName: res.value.firstName,
          lastName: res.value.lastName,
          email: res.value.email
        });
        this.twoFactorEnabled.set(res.value.twoFactorEnabled);
      }
    });
  }

  // --- Genel bilgiler kaydet ---
  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile.set(true);
    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: () => this.savingProfile.set(false),
      error: () => this.savingProfile.set(false)
    });
  }

  // --- Sifre degistir (mevcut sifre zorunlu) ---
  changePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.changingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.profileService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.changingPassword.set(false);
        if (res?.isSuccess) this.passwordForm.reset();
      },
      error: () => this.changingPassword.set(false)
    });
  }

  // --- 2FA ---
  startSetup(): void {
    this.twoFactorError.set(null);
    this.twoFactorBusy.set(true);
    this.profileService.setupTwoFactor().subscribe({
      next: (res) => {
        this.twoFactorBusy.set(false);
        if (res?.isSuccess && res.value) this.setup.set(res.value);
      },
      error: () => this.twoFactorBusy.set(false)
    });
  }

  confirmEnable(): void {
    const code = this.verifyCode().trim();
    if (!code) return;
    this.twoFactorError.set(null);
    this.twoFactorBusy.set(true);
    this.profileService.enableTwoFactor({ code }).subscribe({
      next: (res) => {
        this.twoFactorBusy.set(false);
        if (res?.isSuccess) {
          this.twoFactorEnabled.set(true);
          this.setup.set(null);
          this.verifyCode.set('');
        } else {
          this.twoFactorError.set('Label.TwoFactorInvalidCode');
        }
      },
      error: () => { this.twoFactorBusy.set(false); this.twoFactorError.set('Label.TwoFactorInvalidCode'); }
    });
  }

  cancelSetup(): void { this.setup.set(null); this.verifyCode.set(''); this.twoFactorError.set(null); }

  disable(): void {
    this.twoFactorBusy.set(true);
    this.profileService.disableTwoFactor().subscribe({
      next: (res) => {
        this.twoFactorBusy.set(false);
        if (res?.isSuccess) this.twoFactorEnabled.set(false);
      },
      error: () => this.twoFactorBusy.set(false)
    });
  }
}
// src/app/shared/directives/base-form.directive.ts
import { Directive, OnInit, inject, signal, computed } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { ConfirmService } from '../components/confirm/services/confirm.service';
import { ToastService } from '../components/toast/toast.service';
import { PagePermissionService, PagePerms } from '../services/page-permission.service';
import { getInvalidFieldMessages, buildCombinedErrorMessage } from '../utils/form-error.util';

@Directive()
export abstract class BaseFormDirective implements OnInit {
  // --- ENJEKSİYON KATMANLARI ---
  protected fb = inject(FormBuilder);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected translate = inject(TranslateService);
  protected confirmService = inject(ConfirmService);
  protected toastService = inject(ToastService);
  private permissionService = inject(PagePermissionService);

  // --- REAKTİF SİNYALLER (STATE MANAGEMENT) ---
  formGroup!: FormGroup;
  isEditMode = signal<boolean>(false);
  isPassivedMode = signal<boolean>(false); 
  isSubmitting = signal<boolean>(false);
  isViewReadonlyMode = signal<boolean>(false);
  entityId = signal<string | null>(null);

  // Listeleme sayfasından gelen "buraya geri dön" adresi (filtre/sıralama/sayfa dahil)
  protected returnUrl = signal<string | null>(null);

  protected perms!: PagePerms;

  // --- SOYUT METOTLAR (TÜRETİLEN SINIFLARIN DOLDURMASI ZORUNLU ALANLAR) ---
  protected abstract initForm(): void;
  protected abstract getRedirectUrl(): string;
  protected abstract getSaveObservable(formData: any): Observable<any>;
  protected abstract loadEntityDetails(id: string): void;

  t(key: string): string {
    return this.translate.instant(key);
  }

  ngOnInit(): void {
    this.checkEditAndReadonlyMode();
    this.initForm();
    this.checkPermissionsAndNavigate();
  }

private checkEditAndReadonlyMode(): void {
  const id = this.route.snapshot.paramMap.get('id');

  // NOT: query param adı URL'de "isreadonly" olarak gönderiliyor
  const readonlyParam = this.route.snapshot.queryParamMap.get('isreadonly');

  // YENİ: pasif kayıt mı düzenleniyor/görüntüleniyor bilgisi
  const passivedParam = this.route.snapshot.queryParamMap.get('ispassived');
  this.isPassivedMode.set(passivedParam === 'true');

  // Pasif kayıt her zaman readonly olsun — isreadonly param'ı geçilse bile override edilir
  this.isViewReadonlyMode.set(readonlyParam === 'true' || this.isPassivedMode());

  const returnUrlParam = this.route.snapshot.queryParamMap.get('returnUrl');
  this.returnUrl.set(returnUrlParam);

  if (id) {
    this.isEditMode.set(true);
    this.entityId.set(id);
    this.loadEntityDetails(id);
  }
}
  private checkPermissionsAndNavigate(): void {
    this.perms = this.permissionService.getPermissions(this.route);

    if (!this.perms.view) {
      this.fallbackNavigate('Messages.NoViewPermission');
      return;
    }
    if (this.isEditMode() && !this.perms.update) {
      this.fallbackNavigate('Messages.NoUpdatePermission');
      return;
    }
  }

  private fallbackNavigate(translationKey: string): void {
    this.router.navigate(['/'], {
      state: { toast: { type: 'error', message: this.t(translationKey) } }
    });
  }

  /**
   * Kayıt sonrası ve iptal'de kullanılan ortak yönlendirme.
   * returnUrl varsa (liste sayfasından filtre/sıralama/sayfa bilgisiyle geldiyse) oraya,
   * yoksa türetilen component'in belirttiği varsayılan adrese (getRedirectUrl) döner.
   */
  private navigateBack(): void {
    const url = this.returnUrl();

    // Basit bir güvenlik/format kontrolü: sadece uygulama-içi (relatif) adreslere izin ver.
    if (url && url.startsWith('/')) {
      this.router.navigateByUrl(url);
    } else {
      this.router.navigate([this.getRedirectUrl()]);
    }
  }

  /**
   * Template'teki "İptal" butonuna bağlanacak metot.
   * (click) tabanlı kullanım için — navigateByUrl embedded query string'i doğru parse eder.
   */
  onCancel(): void {
    this.navigateBack();
  }

  /**
   * [routerLink] ile deklaratif kullanım isteyenler için: returnUrl'i path ve
   * queryParams olarak ikiye ayırır. routerLink tek bir string içindeki "?..." kısmını
   * PARSE ETMEZ (literal path segmenti sanır) — bu yüzden path ve queryParams'ı
   * template'te AYRI AYRI bind etmek gerekir:
   *   [routerLink]="cancelUrl()" [queryParams]="cancelQueryParams()"
   */
  cancelUrl = computed(() => {
    const url = this.returnUrl();
    console.log("cancelUrl computed: ", url);
    if(url)
      return this.router.navigateByUrl(url);
    console.log("this.getRedirectUrl()", this.getRedirectUrl());
    if (url && url.startsWith('/')) {
    console.log("this.splitUrl(url).path", this.splitUrl(url).path);
      return this.splitUrl(url).path;
    }
    return this.getRedirectUrl();
  });

  cancelQueryParams = computed(() => {
    const url = this.returnUrl();
    if (url && url.startsWith('/')) {
      return this.splitUrl(url).queryParams;
    }
    return {};
  });

  private splitUrl(url: string): { path: string; queryParams: Record<string, string> } {
    const [path, queryString] = url.split('?');
    const queryParams: Record<string, string> = {};

    if (queryString) {
      new URLSearchParams(queryString).forEach((value, key) => {
        queryParams[key] = value;
      });
    }

    return { path, queryParams };
  }

  // --- MERKEZİ SUBMIT VE VALIDASYON AKIŞI ---
  async onSubmit(): Promise<void> {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();

      const invalidFields = getInvalidFieldMessages(this.formGroup, this.translate);
      const message = buildCombinedErrorMessage(invalidFields);

      this.toastService.error(`${this.t('Error.FormInvalidTitle')}\n\n${message}`);
      return;
    }

    // Ortak onay penceresi tetikleyicisi
    const isConfirmed = await this.confirmService.open();
    if (!isConfirmed) return;

    this.isSubmitting.set(true);

    // Türetilen sayfadan gelen dinamik kayıt veya güncelleme observable yapısını tetikliyoruz
    this.getSaveObservable(this.formGroup.value).subscribe({
      next: (response) => {
        if (response && response.isSuccess) {
          this.navigateBack();
        }
        this.isSubmitting.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
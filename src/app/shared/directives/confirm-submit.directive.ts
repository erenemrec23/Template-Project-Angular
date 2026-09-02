// shared/directives/confirm-submit.directive.ts
import { Directive, Input, HostListener, inject } from '@angular/core';
import { ConfirmService, ConfirmOptions } from '../components/confirm/services/confirm.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Directive({
  selector: 'button[appConfirmSubmit]',
  standalone: true,
})
export class ConfirmSubmitDirective {
  private translate = inject(TranslateService);
    
  t(key: string): string {
    return this.translate.instant(key);
  }
  /**
   * confirm açık/kapalı kontrolü.
   * <button appConfirmSubmit [appConfirmSubmitEnabled]="false">
   */
  @Input() appConfirmSubmitEnabled: boolean = true;

  /**
   * Kısayol mesaj input'u — sadece message değiştirmek istersen
   * <button appConfirmSubmit confirmMessage="Silmek istediğinize emin misiniz?">
   */
  @Input() confirmMessage?: string = this.translate.instant('Label.ConfirmMessage');
  @Input() confirmTitle?: string = this.translate.instant('Label.ConfirmTitle');
  @Input() confirmButtonText?: string= this.translate.instant('Button.Save');
  @Input() cancelButtonText?: string= this.translate.instant('Button.Cancel');

  /**
   * Tam seçenek objesi vermek istersen (öncelikli)
   * <button appConfirmSubmit [confirmOptions]="{ title: '...', message: '...' }">
   */
  @Input() confirmOptions?: ConfirmOptions;

  private confirmService = inject(ConfirmService);

  @HostListener('click', ['$event'])
  async onClick(event: MouseEvent): Promise<void> {
    const button = event.target as HTMLElement;
    const buttonEl = button.closest('button') as HTMLButtonElement | null;

    // disabled butonlarda hiçbir şey yapma
    if (buttonEl?.disabled) return;

    if (!this.appConfirmSubmitEnabled) return; // native submit akışına bırak

    event.preventDefault();

    const options: ConfirmOptions = this.confirmOptions ?? {
      title: this.confirmTitle,
      message: this.confirmMessage,
      confirmButtonText: this.confirmButtonText,
      cancelButtonText: this.cancelButtonText,
    };

    const result = await this.confirmService.open(options);
    if (!result) return;

    const form = buttonEl?.closest('form');
    form?.requestSubmit(buttonEl);
  }
}
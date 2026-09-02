// shared/components/confirm-modal/confirm-modal.component.ts
import { Component, input, output, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.html',
  host: {
    'class': 'block'
  }
})
export class ConfirmModalComponent {
  // --- MODERN SIGNAL INPUTS ---
  private translate = inject(TranslateService);
  isOpen = input<boolean>(false);
  title = input<string>( this.translate.instant('Messages.Confirm'));
  message = input<string>(this.translate.instant('Messages.ConfirmTitle'));
  confirmButtonText = input<string>(this.translate.instant('Messages.ConfirmButtonText'));
  cancelButtonText = input<string>(this.translate.instant('Messages.CancelButtonText'));

  // --- NEW OUTPUTS ---
  confirmed = output<void>();
  cancelled = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('confirm-backdrop')) {
      this.cancelled.emit();
    }
  }
}
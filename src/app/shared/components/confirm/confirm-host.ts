// shared/components/confirm-modal/confirm-host.component.ts
import { Component, inject } from '@angular/core';
import { ConfirmModalComponent } from './confirm-modal';
import { ConfirmService } from './services/confirm.service';

@Component({
  selector: 'app-confirm-host',
  standalone: true,
  imports: [ConfirmModalComponent],
  template: `
    <app-confirm-modal
      [isOpen]="svc.state().isOpen"
      [title]="svc.state().title || 'Emin misiniz?'"
      [message]="svc.state().message || ''"
      [confirmButtonText]="svc.state().confirmButtonText || 'Evet, Devam Et'"
      [cancelButtonText]="svc.state().cancelButtonText || 'İptal'"
      (confirmed)="svc.confirm()"
      (cancelled)="svc.cancel()"
    />
  `,
})
export class ConfirmHostComponent {
  svc = inject(ConfirmService);
}
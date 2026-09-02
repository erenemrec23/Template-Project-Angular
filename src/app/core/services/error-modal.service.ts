// core/services/error-modal.service.ts
import { Injectable,inject } from '@angular/core';
import { ToastService } from '../../shared/components/toast/toast.service'
// Bootstrap küresel nesnesini içeri alıyoruz
declare var bootstrap: any;

@Injectable({
  providedIn: 'root'
})
export class ErrorModalService {

  private toastService = inject(ToastService);
  show(message: string): void {
    const toastElement = document.getElementById('globalErrorToast');
    const messageElement = document.getElementById('globalErrorToastMessage');

    if (toastElement && messageElement) {
      // Mesajı dinamik olarak değiştiriyoruz
      //messageElement.innerText = message;

      // Bootstrap Toast nesnesini konfigüre edip başlatıyoruz
        this.toastService.error(message)

      //const toastInstance = new bootstrap.Toast(toastElement, {
      //  animation: true,
      //  autohide: true,
      //  delay: 5000 // 5 saniye sonra kendiliğinden kaybolur
      //});

      //toastInstance.show();
    } else {
      // Fallback
      alert(message);
    }
  }
}
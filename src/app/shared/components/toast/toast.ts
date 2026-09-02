// src/app/shared/components/toast/toast.ts
import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast-element',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast.html'
  // styleUrl tamamen temizlendi!
})
export class ToastComponent {
  message = input<string>('');
  type = input<'success' | 'error'>('success');
  
  closeRequest = output<void>();

  onCloseClick(): void {
    this.closeRequest.emit();
  }
}
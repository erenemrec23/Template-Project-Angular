import { Component, input, output } from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html'
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('İşlem');
  
  // YENİ: Modal boyutunu dışarıdan alıyoruz (varsayılan: md)
  size = input<ModalSize>('md');

  closeModal = output<void>();

  close(): void {
    this.closeModal.emit();
  }

  // Tailwind genişlik sınıflarını hesaplayan yardımcı metot
  getModalWidthClass(): string {
    switch (this.size()) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-3xl';
      case 'xl': return 'max-w-5xl';
      case '2xl': return 'max-w-7xl';
      case 'md':
      default:
        return 'max-w-[450px]';
    }
  }
}
// shared/services/confirm.service.ts
import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState>({
    isOpen: false,
    resolve: null,
    title: 'Emin misiniz?',
    message: 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?',
    confirmButtonText: 'Evet, Devam Et',
    cancelButtonText: 'İptal',
  });

  open(options: ConfirmOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({
        isOpen: true,
        resolve,
        title: options.title ?? 'Emin misiniz?',
        message: options.message ?? 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?',
        confirmButtonText: options.confirmButtonText ?? 'Evet, Devam Et',
        cancelButtonText: options.cancelButtonText ?? 'İptal',
      });
    });
  }

  confirm(): void {
    this._resolve(true);
  }

  cancel(): void {
    this._resolve(false);
  }

  private _resolve(value: boolean): void {
    const current = this.state();
    current.resolve?.(value);
    this.state.set({ ...current, isOpen: false, resolve: null });
  }
}
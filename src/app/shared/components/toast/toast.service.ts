import { Injectable, inject, createComponent, EnvironmentInjector, ApplicationRef, ComponentRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ToastComponent } from './toast';

export type ToastType = 'success' | 'error';

interface ToastItem {
  message: string;
  type: ToastType;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private document = inject(DOCUMENT);
  private injector = inject(EnvironmentInjector);
  private appRef = inject(ApplicationRef);

  private currentToastRef: ComponentRef<ToastComponent> | null = null;
  private autoCloseTimeout: any = null;
  private queue: ToastItem[] = [];
  private isShowing = false;

  success(message: string, duration: number = 3000): void {
    this.enqueue(message, 'success', duration);
  }

  error(message: string, duration: number = 3000): void {
    this.enqueue(message, 'error', duration);
  }

  private enqueue(message: string, type: ToastType, duration: number): void {
    this.queue.push({ message, type, duration });
    if (!this.isShowing) {
      this.showNext();
    }
  }

  private showNext(): void {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const { message, type, duration } = this.queue.shift()!;

    this.currentToastRef = createComponent(ToastComponent, {
      environmentInjector: this.injector
    });

    this.currentToastRef.setInput('message', message);
    this.currentToastRef.setInput('type', type);

    this.currentToastRef.instance.closeRequest.subscribe(() => {
      this.clear();
    });

    this.appRef.attachView(this.currentToastRef.hostView);
    const domElem = (this.currentToastRef.hostView as any).rootNodes[0] as HTMLElement;
    this.document.body.appendChild(domElem);

    this.autoCloseTimeout = setTimeout(() => {
      this.clear();
    }, duration);
  }

  clear(): void {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = null;
    }

    if (this.currentToastRef) {
      this.appRef.detachView(this.currentToastRef.hostView);
      this.currentToastRef.destroy();
      this.currentToastRef = null; 
    }

    // Sıradaki toast'u göster
    setTimeout(() => this.showNext(), 300);
  }
}
// shared/services/sidebar-state.service.ts
import { Injectable, signal } from '@angular/core';

/**
 * Sidebar'ın daraltılmış/genişletilmiş durumunu tutar.
 * Hem SidebarComponent (kendi genişliğini belirlemek için) hem de
 * MainLayoutComponent (içerik alanının margin-left'ini kaydırmak için)
 * bu servisi paylaşır.
 */
@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  readonly isExpanded = signal(false);

  toggle(): void {
    this.isExpanded.update((v) => !v);
  }
  setExpanded(value: boolean): void {
    this.isExpanded.set(value);
  }
}
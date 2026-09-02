// main-layout.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { SidebarComponent } from '../sidebar/sidebar';
import { SidebarStateService } from '../sidebar/services/sidebar-state.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.html',
  // Eski main-layout.css'teki :host kuralı artık host metadata üzerinden Tailwind ile veriliyor.
  // Font stack tailwind.config.js -> theme.extend.fontFamily.sans içinde tanımlı (bkz. not).
  host: {
    class: 'block font-sans',
  },
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService); // Servis enjeksiyonu
  private sidebarState = inject(SidebarStateService);

  isProfileMenuOpen = signal<boolean>(false);

  /**
   * İçerik alanının sol boşluğu artık sidebar'ın durumuna göre kayıyor.
   * ml-[72px] (daraltılmış) <-> ml-60 (genişletilmiş, 240px) — sidebar ile aynı süre/easing.
   */
  mainClasses = computed(() => {
    const base = 'p-6 min-h-screen transition-[margin-left] duration-200 ease-in-out';
    return `${base} ${this.sidebarState.isExpanded() ? 'ml-60' : 'ml-[72px]'}`;
  });

  ngOnInit(): void {

  }

  toggleProfileMenu(): void { this.isProfileMenuOpen.update(state => !state); }
  closeProfileMenu(): void { this.isProfileMenuOpen.set(false); }
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
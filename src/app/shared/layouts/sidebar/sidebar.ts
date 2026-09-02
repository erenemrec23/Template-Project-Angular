import { Component, inject, computed, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter, map, tap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { SidebarStateService } from './services/sidebar-state.service';
import { MenuGroupConfig } from '../../../core/constants/pages';
import { AuthService } from '../../../features/auth/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { MenuService } from '../../../core/services/menu.service';
import { PagePermissionService } from '../../../shared/services/page-permission.service';
import { SharedButtonComponent } from '../../../shared/components/button/button';
import { FeedbackModalComponent, FeedbackData } from '../../../features/feedback/feedback-modal/feedback-modal'; 
import { ToastService } from '../../../shared/components/toast/toast.service';
import { FeedbackService } from  '../../../features/feedback/services/feedback.service';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SharedButtonComponent, FeedbackModalComponent],
  templateUrl: './sidebar.html'
})
export class SidebarComponent {

  @ViewChild(FeedbackModalComponent) feedbackModal!: FeedbackModalComponent;

  private translate = inject(TranslateService);
  private sidebarState = inject(SidebarStateService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private menuService = inject(MenuService);
  private pagePermission = inject(PagePermissionService);
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private feedbackService = inject(FeedbackService);
  t(key: string): string {
    return this.translate.instant(key);
  }

  menuGroups = signal<MenuGroupConfig[]>([]);
  isExpanded = this.sidebarState.isExpanded;
  expandedGroups = signal<Set<string>>(new Set());

  visibleMenuGroups = computed<MenuGroupConfig[]>(() =>
    this.menuGroups()
      .map(group => ({
        ...group,
        children: group.children.filter(child => this.pagePermission.canViewPage(child.pageKey))
      }))
      .filter(group => group.children.length > 0)
  );

  currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects.split('?')[0]),
      tap(url => {
        const active = this.visibleMenuGroups().find(group =>
          group.children.some(child => child.route === url)
        );
        if (active) {
          this.openGroup(active.key);
        }
      })
    ),
    { initialValue: this.router.url.split('?')[0] }
  );

  isHomePage = computed(() => {
    const url = this.currentUrl();
    return url === '/' || url === '/dashboard';
  });

  activeGroup = computed(() => {
    const url = this.currentUrl();
    return this.visibleMenuGroups().find(group =>
      group.children.some(child => child.route === url)
    );
  });

  collapsedItems = computed<Array<{ type: 'group' | 'child', data: any }>>(() => {
    const active = this.activeGroup();

    if (this.isHomePage() || !active) {
      return this.visibleMenuGroups().map(group => ({ type: 'group', data: group }));
    }

    return active.children.map(child => ({ type: 'child', data: child }));
  });

  constructor() {
    this.menuService.getMenu().subscribe(res => {
      if (res.isSuccess && res.value) this.menuGroups.set(res.value);
    });

    const initialActive = this.activeGroup();
    if (initialActive) {
      this.openGroup(initialActive.key);
    }
  }

  toggleSidebar(): void {
    const willBeExpanded = !this.isExpanded();
    this.sidebarState.toggle();

    if (willBeExpanded) {
      const active = this.activeGroup();
      if (active) {
        this.openGroup(active.key);
      }
    }
  }

  handleGroupClick(groupLabel: string): void {
    this.sidebarState.setExpanded(true);
    this.openGroup(groupLabel);
  }

  toggleGroup(groupLabel: string): void {
    if (!this.isExpanded()) {
      this.handleGroupClick(groupLabel);
      return;
    }

    const current = new Set(this.expandedGroups());
    if (current.has(groupLabel)) {
      current.delete(groupLabel);
    } else {
      current.add(groupLabel);
    }
    this.expandedGroups.set(current);
  }

  private openGroup(groupLabel: string): void {
    const current = new Set(this.expandedGroups());
    if (!current.has(groupLabel)) {
      current.add(groupLabel);
      this.expandedGroups.set(current);
    }
  }

  isGroupExpanded(groupLabel: string): boolean {
    return this.expandedGroups().has(groupLabel);
  }

  // --- Geri Bildirim Modalını Tetikleme ---
  openFeedbackModal(): void {
    if (this.feedbackModal) {
      this.feedbackModal.openFeedback();
    }
  }

  onFeedbackSaved(data: FeedbackData): void {
    const payload = {
      comment: data.comment,
      screenshotBase64: data.screenshotBase64,
      pageUrl: window.location.href
    };

    this.feedbackService.sendFeedback(payload).subscribe({
      next: (res) => {
        //this.isSubmitting.set(false);
        this.toast.success('Geri bildiriminiz için teşekkür ederiz. E-posta iletildi.');
        //this.close();
      },
      error: () => {
        //this.isSubmitting.set(false);
        this.toast.error('Geri bildirim gönderilirken bir hata oluştu.');
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
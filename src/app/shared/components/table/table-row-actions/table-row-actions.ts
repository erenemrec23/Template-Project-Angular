// shared/components/table/table-row-actions/table-row-actions.ts
import { Component, input, output, inject, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { PagePermissionService } from '../../../services/page-permission.service';
import { RowAction } from './table-row-action.model';

@Component({
  selector: 'app-table-row-actions',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './table-row-actions.html',
  host: {
    'class': 'table-cell px-4 py-2 border-b border-slate-100 vertical-align-middle transition-colors duration-200',
    '[class.sticky]': 'true',
    '[class.right-0]': 'true',
    '[class.z-10]': 'true',
    '[class.bg-white]': 'true',
    '[class.shadow-[-4px_0_8px_rgba(0,0,0,0.05)]]': 'true'
  }
})
export class TableRowActionsComponent {
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private permissions = inject(PagePermissionService);

  canEdit = computed(() => this.permissions.canUpdate(this.route, this.showEdit()));
  canRemove = computed(() => this.permissions.canDelete(this.route, this.showDelete()));
  canSetActive = computed(() => this.permissions.canSetActive(this.route, this.showSetActive()));
  
  id = input.required<string | number>();
  editRouterLink = input.required<any[] | string>();

  showEdit = input<boolean>();
  showDelete = input<boolean>();
  showSetActive = input<boolean>();
  showView = input<boolean>(true);
  extraActions = input<RowAction[]>([]); 

  // --- YENİ REAKTİF MOD GİRDİLERİ ---
  hasSelection = input<boolean>(false); // Tabloda herhangi bir seçim var mı?
  isPassivedRow = input<boolean>(false);
  isSelected = input<boolean>(false);   // Bu spesifik satır seçili mi?

  visibleExtraActions = computed(() =>
    this.extraActions().filter(a => {
      if (typeof a.visible === 'function') return a.visible();
      return a.visible !== false;
    })
  );

  deleted = output<string | number>();
  setActive =  output<string | number>();
  // --- YENİ SEÇİM ÇIKTISI ---
  selected = output<string | number>(); // Seç butonuna veya checkbox'a basılınca fırlatılır

  isDropdownOpen = signal<boolean>(false);
  private currentListUrl = computed(() => this.router.url);

  editQueryParams = computed(() => ({ returnUrl: this.currentListUrl(), ispassived: this.isPassivedRow() ? 'true' : null }));
  viewQueryParams = computed(() => ({ returnUrl: this.currentListUrl(), isreadonly: 'true', ispassived: this.isPassivedRow() ? 'true' : null }));

  viewRouterLink = computed(() => {
    const link = this.editRouterLink();
    return Array.isArray(link) ? link : [link];
  });

  t(key: string): string { return this.translate.instant(key); }
  openDropdown(): void { this.isDropdownOpen.set(true); }
  closeDropdown(): void { this.isDropdownOpen.set(false); }
  
  onDeleteClick(): void {
    this.closeDropdown();
    this.onDelete();
  }
  onSetActiveClick(): void {
    this.closeDropdown();
    this.onSetActive();
  }

  

  onDelete(): void { this.deleted.emit(this.id()); }
  onSetActive(): void { this.setActive.emit(this.id()); }

  onExtraActionClick(action: RowAction): void {
    this.closeDropdown();
    action.onClick?.();
  }

  // Seç butonu veya Checkbox tıklandığında çalışacak merkezi tetikleyici
  onSelectToggle(): void {
    this.closeDropdown();
    this.selected.emit(this.id());
  }
}
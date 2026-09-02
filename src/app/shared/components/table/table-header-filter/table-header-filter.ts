// shared/components/table/table-header-filter/table-header-filter.ts
import { Component, model, output, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SharedButtonComponent } from '../../button/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {PagePermissionService} from '../../../services/page-permission.service'
@Component({
  selector: 'div[table-header-filter], section[table-header-filter]',
  standalone: true,
  imports: [FormsModule, TranslatePipe, SharedButtonComponent],
  templateUrl: './table-header-filter.html',
  host: {
    'class': 'flex items-center justify-between gap-4 mb-4 w-full'
  }
})
export class TableHeaderFilterComponent {
  protected route = inject(ActivatedRoute);
  searchQuery = model<string>('');

  showBulkDelete = input<boolean>(true); 
  showBulkSetActive = input<boolean>(true); 
  showBulkSetPassive = input<boolean>(true); 
  showSelectAll = input<boolean>(true); 
   
  hasSelection = input<boolean>(false);  
  selectedCount = input<number>(0);      

  // --- AKTİF / SİLİNEN RADIO FİLTRESİ ---
  showPassivedFilter = input<boolean>(false);  
  showPassived = model<boolean>(false);      
  
  // --- OUTPUTS ---
  clearFilters = output<void>();
  searchChange = output<void>();
  bulkDelete = output<void>();  
  bulkSetActive = output<void>();  
  bulkSetPassive = output<void>();
  toggleSelectAll = output<void>(); 
  resetPage = output<void>();
  toggleClearAll =  output<void>(); 
  private permissions = inject(PagePermissionService);
  canBulkDelete = computed(() => this.permissions.canDelete(this.route, this.showBulkDelete()));
  canBulkSetActive = computed(() => this.permissions.canSetActive(this.route, this.showBulkSetActive()));
  canBulkSetPassive = computed(() => this.permissions.canSetPassive(this.route, this.showBulkSetPassive()));
  canViewPassive = computed(() => this.permissions.canViewPassive(this.route, this.showPassivedFilter()));
  
  private queryParams = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  hasActiveFilters = computed(() => {
    const params = this.queryParams();
    return params.keys
      .filter(key => key.endsWith('Value') || key == 'sortField' || key == 'sortOrder' || key == 'page' || key == 'pageSize' || key == 'pageIndex').length > 0;
  });

  onClearClick(): void {
    this.clearFilters.emit();
  }

  onSearchChange(): void {
    this.searchChange.emit();
  }

  onBulkDeleteClick(): void {
    this.bulkDelete.emit();
  }
  
  onBulkSetPassiveClick(): void {
    this.bulkSetPassive.emit();
  }
  onBulkSetActiveClick(): void {
    this.bulkSetActive.emit();
  }
  onToggleSelectAllClick(): void {
    this.toggleSelectAll.emit();
  } 
  onResetPageClick(): void {
    console.log("onResetPageClick")
    this.resetPage.emit();
  } 
   
  onToggleClearAlllClick(): void {
    this.toggleClearAll.emit();
  } 
   
}
import { Component, input, output, inject, computed } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TooltipDirective } from '../../../directives/tooltip.directive';

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  templateUrl: './table-pagination.html',
  imports: [TooltipDirective]
})
export class TablePaginationComponent {
  private translate = inject(TranslateService);

  // --- PARENT BİLEŞENDEN GELECEK VERİLER (Signal Inputs) ---
  pageIndex = input.required<number>();
  pageSize = input.required<number>();
  totalCount = input.required<number>();
  totalPages = input.required<number>();
  hasNext = input.required<boolean>();
  hasPrevious = input.required<boolean>();

  // --- PARENT BİLEŞENE FIRLATILACAK EVENTLER (New Outputs) ---
  pageChange = output<number>();
  pageSizeChange = output<number>();

  t(key: string): string {
    return this.translate.instant(key);
  }

  // --- DİNAMİK HESAPLAMALAR (Computed Signals) ---
  
  rangeStart = computed(() => {
    return this.totalCount() === 0 ? 0 : (this.pageIndex() * this.pageSize()) + 1;
  });

  rangeEnd = computed(() => {
    return Math.min((this.pageIndex() + 1) * this.pageSize(), this.totalCount());
  });

  visiblePages = computed<number[]>(() => {
    const maxVisible = 5;
    let start = Math.max(0, this.pageIndex() - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages() - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  // --- NAVİGASYON TETİKLEYİCİLERİ ---

  goToPage(index: number): void {
    if (index >= 0 && index < this.totalPages() && index !== this.pageIndex()) {
      this.pageChange.emit(index);
    }
  }

  firstPage(): void { this.goToPage(0); }
  lastPage(): void { this.goToPage(this.totalPages() - 1); }
  nextPage(): void { if (this.hasNext()) this.goToPage(this.pageIndex() + 1); }
  previousPage(): void { if (this.hasPrevious()) this.goToPage(this.pageIndex() - 1); }

  onChangePageSize(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSizeChange.emit(Number(target.value));
  }
}
// src/app/shared/components/list-actions/list-actions.component.ts
import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TooltipDirective } from '../../../directives/tooltip.directive';
@Component({
  selector: 'app-table-row-action-edit',
  standalone: true,
  imports: [RouterLink, TooltipDirective],
  templateUrl: './table-row-action-edit.html'
})
export class TableRowActionEditComponent {
  private translate = inject(TranslateService);
  t(key: string): string {
    return this.translate.instant(key);
  }
  // Modern Signal Inputs (Zorunlu alanlar)
  editRouterLink = input.required<any[] | string>(); 

  
}
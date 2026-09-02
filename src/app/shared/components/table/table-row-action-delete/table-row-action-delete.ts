// src/app/shared/components/list-actions/list-actions.component.ts
import { Component, input, output, inject } from '@angular/core'; 
import { TranslateService } from '@ngx-translate/core';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { SharedButtonComponent } from '../../button/button';
@Component({
  selector: 'app-table-row-action-delete',
  standalone: true, 
  templateUrl: './table-row-action-delete.html', 
  imports: [TooltipDirective, SharedButtonComponent]
})
export class TableRowActionDeleteComponent {
  private translate = inject(TranslateService);
  t(key: string): string {
    return this.translate.instant(key);
  }
 
  id = input.required<string>();

  // Modern Output (Silme tetikleyici event)
  deleted = output<string>(); 

onDelete(): void {
  // id() değerinin string veya number olduğundan emin ol
  this.deleted.emit(this.id()); 
}
}
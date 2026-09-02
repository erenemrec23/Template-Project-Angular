import { Component, input, model } from '@angular/core';
import {TabItem} from './tab-item.model'


@Component({
  selector: 'app-tab-container',
  standalone: true,
  templateUrl: './tab.html'
})
export class TabContainerComponent {
  /** Sekme tanımları — id benzersiz olmalı */
  tabs = input.required<TabItem[]>();

  /** Aktif sekmenin id'si (iki yönlü bağlanabilir) */
  value = model.required<string>();

  select(tab: TabItem): void {
    if (tab.disabled) return;
    this.value.set(tab.id);
  }
}
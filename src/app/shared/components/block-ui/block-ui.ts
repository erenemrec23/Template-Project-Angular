// src/app/shared/components/block-ui/block-ui.component.ts
import { Component, inject } from '@angular/core';
import { BlockUiService } from '../../../core/services/block-ui.service';

@Component({
  selector: 'app-block-ui',
  standalone: true,
  templateUrl : './block-ui.html'
})
export class BlockUiComponent {
  blockUiService = inject(BlockUiService);
}
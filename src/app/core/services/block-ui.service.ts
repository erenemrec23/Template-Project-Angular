// src/app/core/services/block-ui.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BlockUiService {
  private _isBlocked = signal(false);
  
  readonly isBlocked = this._isBlocked.asReadonly();

  block(): void {
    this._isBlocked.set(true);
  }

  unblock(): void {
    this._isBlocked.set(false);
  }
}
// src/app/app.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BlockUiComponent } from './shared/components/block-ui/block-ui';
import { ToastService } from './shared/components/toast/toast.service';
import { filter } from 'rxjs';
import { ConfirmHostComponent } from './shared/components/confirm/confirm-host';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BlockUiComponent, ConfirmHostComponent],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  private translate  = inject(TranslateService);
  private router     = inject(Router);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.translate.addLangs(['tr-TR', 'en-US']);
    this.translate.setFallbackLang('tr-TR');
    this.translate.use('tr-TR');

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const toast = history.state?.toast;
        if (toast) {
          setTimeout(() => {
            this.toastService[toast.type as 'error' | 'success'](toast.message);
          }, 100);
        }
      });
  }
}
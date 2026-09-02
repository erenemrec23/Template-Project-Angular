import { Component, inject, signal } from '@angular/core';  
import { RouterLink } from '@angular/router';

@Component({
  imports:[RouterLink],
  selector: 'app-forbidden',
  standalone: true,
  template: `
    <div style="text-align:center; margin-top: 100px;">
      <h1>403</h1>
      <p>Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
      <a routerLink="/">Ana Sayfaya Dön</a>
    </div>
  `,
})
export class ForbiddenComponent {}
// shared/components/form-header/form-header.ts
import { Component, inject, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-form-header',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './form-header.html',
  host: {
    'class': 'block w-full'
  }
})
export class FormHeaderComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
 
  title = input<string>('');
  // tr.json'daki ortak önek, örn: 'Tenant', 'Role' 

  // Router navigasyonlarını (list <-> new <-> edit geçişlerini) signal'e çeviriyoruz
  // ki component yeniden yaratılmadan sadece route değiştiğinde de başlık güncellensin
  private navigationEnd = toSignal(
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)),
    { initialValue: null }
  );

private toPrefix(segment: string): string {
  const singular = segment.endsWith('s') ? segment.slice(0, -1) : segment;
  return singular.charAt(0).toUpperCase() + singular.slice(1); // 'role' -> 'Role'
}
  titleKey = computed(() => {
    this.navigationEnd(); // dependency: her navigasyonda yeniden hesapla
    if(this.title())
      return this.title();
    const path = this.router.url.split('?')[0];
    const segments = path.split('/').filter(Boolean); // ['roles', 'form', 'acac...']
    const prefix = this.toPrefix(segments[0]); // 'roles' -> 'Tenant' / 'Role'

    const hasId = this.route.snapshot.paramMap.has('id'); 
    const isFormRoute = path.includes('/form');

    if (isFormRoute && hasId) return `${prefix}.Form.Title.Edit`;
    if (isFormRoute) return `${prefix}.Form.Title.New`;
    return `${prefix}.List.Title`;
  });
  
}
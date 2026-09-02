// src/app/shared/pipes/has-permission.pipe.ts
import { Pipe, PipeTransform, inject } from '@angular/core';
import { PagePermissionService } from '../../shared/services/page-permission.service';

@Pipe({ name: 'hasPermission', standalone: true, pure: false })
export class HasPermissionPipe implements PipeTransform {
  private pagePermissionService = inject(PagePermissionService);

  // kullanım: 'Page_Users' | hasPermission: 4  (Update biti)
  transform(pageName: string, bit: number): boolean {
    return this.pagePermissionService.can(pageName, bit);
  }
}
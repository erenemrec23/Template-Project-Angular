import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true // Angular 21 Standalone standardı
})
export class TruncatePipe implements PipeTransform {

  transform(value: any, limit: number = 50): string {
    if (!value) {
      return '';
    }
    // 1. KRİTİK KONTROL: Değer null/undefined ise veya tipi string değilse substring yapma, boş dön
    if (value && typeof value !== 'string') {
      return value;
    }
    
    // Eğer metin zaten belirlenen limitten kısaysa olduğu gibi dön
    if (value.length <= limit) {
      return value;
    }

    // Belirlenen karakterden kes ve sonuna üç nokta ekle
    return value.substring(0, limit) + '...';
  }
}
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelCoreService {

  /**
   * Herhangi bir nesne array'ini Excel dosyasına dönüştürüp indirir.
   * @param data Export edilecek DTO / JSON dizisi
   * @param fileName İndirilecek dosyanın adı (uzantısız)
   * @param sheetName Çalışma sayfasının adı
   */
  exportToExcel<T>(
  data: T[],
  fileName: string,
  sheetName: string = 'Sayfa1',
  headers?: { key: keyof T; label: string }[]
): void {
  if (!data || data.length === 0) {
    console.warn('Dışa aktarılacak veri bulunamadı.');
    return;
  }

  let worksheet: XLSX.WorkSheet;

  if (headers && headers.length > 0) {
    // Sadece belirtilen key'leri, belirtilen sırada al
    const keys = headers.map(h => h.key);
    const labels = headers.map(h => h.label);

    // Veriyi key sırasına göre array-of-arrays'e çevir
    const rows = data.map(item => keys.map(k => item[k]));

    // Header + data'yı birleştirip sheet oluştur
    worksheet = XLSX.utils.aoa_to_sheet([labels, ...rows]);
  } else {
    // Header verilmezse eski davranış (obje key'leri header olur)
    worksheet = XLSX.utils.json_to_sheet(data);
  }

  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Tüm uygulamada tek bir instance olarak çalışması için
})
export class FileDownloadService {

  /**
   * Gelen Blob verisini belirtilen dosya ismiyle tarayıcıya Excel (veya başka format) olarak indirtir.
   * @param blob Backend'den gelen binary dosya verisi
   * @param baseFileName Dosyanın ana adı (Örn: 'Firmalar_Listesi', 'Kullanici_Raporu')
   */
  downloadExcel(blob: Blob, baseFileName: string): void {
    // 1. Blob verisini tarayıcıda indirilebilir bir URL'ye dönüştür
    const url = window.URL.createObjectURL(blob);
    
    // 2. Görünmez bir <a> etiketi oluştur ve tıklama simülasyonu yap
    const a = document.createElement('a');
    a.href = url;
    
    // 3. Dosya adının sonuna güncel tarihi ekle
    const dateString = new Date().toISOString().split('T')[0];
    a.download = `${baseFileName}_${dateString}.xlsx`; 
    
    // 4. DOM'a ekle, tıkla ve temizle
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
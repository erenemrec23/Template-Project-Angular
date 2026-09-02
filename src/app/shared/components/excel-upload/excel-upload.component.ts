// src/app/shared/components/excel-upload/excel-upload.component.ts
import { Component, signal, inject, input } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ExcelUploadService } from './services/excel-upload.service';

@Component({
  selector: 'app-excel-upload',
  standalone: true,
  imports: [],
  templateUrl: './excel-upload.html'
})
export class ExcelUploadComponent {
  private excelUploadService = inject(ExcelUploadService);
  private translate = inject(TranslateService);

  // Esneklik için API endpoint yolunu dışarıdan zorunlu girdi olarak alıyoruz
  // Örn kullanım: <app-excel-upload apiUrl="Tenants/Import" />
  apiUrl = input.required<string>();

  // Angular v21 Signals ile State Yönetimi
  isDragOver = signal<boolean>(false);
  selectedFile = signal<File | null>(null);
  uploadProgress = signal<number>(0);
  uploadStatus = signal<'idle' | 'uploading' | 'success' | 'error'>('idle');

  t(key: string): string {
    return this.translate.instant(key);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave() {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.validateAndPrepareFile(file);
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.validateAndPrepareFile(file);
    }
  }

  private validateAndPrepareFile(file: File) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      this.selectedFile.set(file);
      this.uploadFileToServer(file);
    } else {
      alert(this.t('Messages.InvalidExcelFormat'));
    }
  }

  private uploadFileToServer(file: File) {
    this.uploadStatus.set('uploading');
    this.uploadProgress.set(0);

    // Doğrudan yeni servisimizi çağırıyoruz ve apiUrl sinyal değerini besliyoruz
    this.excelUploadService.uploadExcel(this.apiUrl(), file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            this.uploadProgress.set(progress);
          }
        } else if (event instanceof HttpResponse) {
          this.uploadStatus.set('success');
          this.uploadProgress.set(100);
        }
      },
      error: (err) => {
        this.uploadStatus.set('error');
        console.error(this.t('Messages.ExcelUploadConsoleError'), err);
      }
    });
  }

  getFileSize(bytes: number | undefined): string {
    if (!bytes) return `0 ${this.t('Messages.Byte')}`;
    const k = 1024;
    const sizes = [this.t('Messages.Byte'), this.t('Messages.Kb'), this.t('Messages.Mb')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
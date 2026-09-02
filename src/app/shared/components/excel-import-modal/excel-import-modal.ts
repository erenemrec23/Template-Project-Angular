import { Component, signal, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExcelImportModalService } from './services/excel-import-modal.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { PagePermissionService } from '../../services/page-permission.service';
import { ToastService } from '../toast/toast.service';
import * as XLSX from 'xlsx';

export interface ExcelColumnConfig {
  headerKey: string;
  field: string;
}

export interface ColumnMapping {
  expectedField: string;      // Arayüzün/Backend'in beklediği field adı (örn: 'code', 'name')
  expectedHeaderKey: string; // Arayüzün beklediği etiket (örn: 'Title.Tenant.Name')
  userHeader: string;        // Kullanıcının Excel'deki başlığı (örn: 'aa', 'cc')
}

type ImportStep = 'upload' | 'mapping' | 'preview';

@Component({
  selector: 'app-excel-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './excel-import-modal.html',
  host: {
    'class': 'block'
  }
})
export class ExcelImportModalComponent {

  private toast = inject(ToastService);
  private excelImportModalService = inject(ExcelImportModalService);
  private translate = inject(TranslateService);
  private permissions = inject(PagePermissionService);
  private route = inject(ActivatedRoute);

  private selectedFile: File | null = null;

  // --- MODERN SIGNAL INPUTS --- 
  canExport = input<boolean>(true);
  canExportExcel = computed(() => this.permissions.canExportExcel(this.route, this.canExport()));

  validateEndpoint = input.required<string>();
  commitEndpoint = input.required<string>();
  columns = input.required<ExcelColumnConfig[]>();

  // --- OUTPUTS ---
  close = output<void>();
  importCompleted = output<void>();
  bulkCreate = output<{ 
    data: any[]; 
    onSuccess: () => void  
    onError: () => void
    onFinally: () => void
  }>();
  downloadTemplate = output<void>();
  exportSampleDataListExcel = output<void>();

  // --- STATE SIGNALS ---
  currentStep = signal<ImportStep>('upload');
  isLoading = signal<boolean>(false);
  
  uploadedHeaders = signal<string[]>([]);
  columnMappings = signal<ColumnMapping[]>([]);
  validationResponse = signal<any | null>(null);

  isMappingValid = computed(() => {
    const mappings = this.columnMappings();
    if (mappings.length === 0) return false;
    return mappings.every(m => m.userHeader && m.userHeader.trim() !== '');
  });

  t(key: string): string {
    return this.translate.instant(key);
  }

  closeModal() {
    this.close.emit();
  }

  onDownloadDataExcel() {
    this.downloadTemplate.emit();
  }

  onExportSampleDataListExcelClick(): void {
    this.exportSampleDataListExcel.emit();
    this.toast.success(this.translate.instant('Message.ExcelExported'));
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
      this.readExcelHeadersAndDetermineStep(file);
    }
  }

  /**
   * 1. ADIM: İstemci tarafında Excel dosyasının ilk satırındaki başlıkları okur.
   */
  private readExcelHeadersAndDetermineStep(file: File) {
    this.isLoading.set(true);
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const sheetJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const excelHeaders: string[] = (sheetJson && sheetJson.length > 0) 
          ? sheetJson[0].map((h: any) => String(h ?? '').trim()) 
          : [];

        this.uploadedHeaders.set(excelHeaders);

        const expectedCols = this.columns();
        const mappings: ColumnMapping[] = [];
        let unmappedCount = 0;

        expectedCols.forEach(col => {
          const translatedHeader = this.t(col.headerKey).toLowerCase().trim();
          const fieldName = col.field.toLowerCase().trim();

          // Excel içindeki başlıklarla kıyasla
          const exactMatch = excelHeaders.find(h => {
            const hLower = h.toLowerCase().trim();
            return hLower === translatedHeader || hLower === fieldName || hLower === col.headerKey.toLowerCase().trim();
          });

          if (exactMatch) {
            mappings.push({
              expectedField: col.field,
              expectedHeaderKey: col.headerKey,
              userHeader: exactMatch
            });
          } else {
            unmappedCount++;
            mappings.push({
              expectedField: col.field,
              expectedHeaderKey: col.headerKey,
              userHeader: ''
            });
          }
        });

        this.columnMappings.set(mappings);
        this.isLoading.set(false);

        // Eğer uyuşmayan kolon varsa Mapping ekranına yönlendir
        if (unmappedCount > 0) {
          this.currentStep.set('mapping');
        } else {
          // Hepsi uyuşuyorsa dosyayı olduğu gibi gönder
          this.validateExcelOnBackend(file);
        }
      } catch (err) {
        this.toast.error(this.translate.instant('ExcelImport.AnalysisError'));
        this.isLoading.set(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  onMappingChange(expectedField: string, selectedUserHeader: string) {
    this.columnMappings.update(mappings => 
      mappings.map(m => m.expectedField === expectedField ? { ...m, userHeader: selectedUserHeader } : m)
    );
  }

  /**
   * 2. ADIM: Kullanıcı eşleştirmeyi onaylayınca Excel'i frontend'de backend'in formatına dönüştürüp gönderir.
   */
  onConfirmMapping() {
    if (!this.isMappingValid()) {
      this.toast.error(this.translate.instant('ExcelImport.PleaseMapAllColumns') || 'Lütfen tüm kolonları eşleştirin.');
      return;
    }

    if (this.selectedFile) {
      this.remapExcelFileAndValidate(this.selectedFile, this.columnMappings());
    }
  }

  /**
   * Kullanıcının Excel dosyasını okur, başlıkları Backend'in beklediği field adlarıyla ('code', 'name' vb.) değiştirir
   * ve yeni bir File nesnesi üreterek Backend'e yollar.
   */
 /**
   * Kullanıcının Excel dosyasını okur, başlıkları Backend'in beklediği field adlarıyla ('code', 'name' vb.) değiştirir
   * ve yeni bir File nesnesi üreterek Backend'e yollar.
   */
  /**
   * Kullanıcının Excel dosyasını okur, başlıkları Backend'in beklediği çeviri karşılıklarıyla
   * ('Kod', 'Firma Adı' vb. -> this.t(col.headerKey)) değiştirir ve yeni bir File nesnesi üreterek Backend'e yollar.
   */
  private remapExcelFileAndValidate(file: File, mappings: ColumnMapping[]) {
    this.isLoading.set(true);
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Excel verisini array/json formatına çevir
        const sheetRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!sheetRows || sheetRows.length === 0) {
          this.toast.error(this.translate.instant('ExcelImport.AnalysisError'));
          this.isLoading.set(false);
          return;
        }

        const originalHeaders: string[] = sheetRows[0].map((h: any) => String(h ?? '').trim());

        // Kullanıcının seçtiği mapping mantığını dictionary yap:
        // { "aa": "Kod", "cc": "Firma Adı" } -> field yerine translate edilmiş headerKey veriliyor
        const userHeaderToTargetTranslatedHeader: Record<string, string> = {};
        mappings.forEach(m => {
          if (m.userHeader) {
            // expectedField ('code') yerine tr.json karşılığı olan 'Kod' veriliyor
            userHeaderToTargetTranslatedHeader[m.userHeader] = this.t(m.expectedHeaderKey);
          }
        });

        // 1. Satırdaki (Başlıklar) isimleri backend'in beklediği tr.json değerleriyle değiştir
        const newHeaders = originalHeaders.map(oldHeader => userHeaderToTargetTranslatedHeader[oldHeader] || oldHeader);
        sheetRows[0] = newHeaders;

        // Yeniden yapılandırılmış veriden yeni bir worksheet ve workbook üret
        const newWorksheet = XLSX.utils.aoa_to_sheet(sheetRows);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, firstSheetName);

        // Workbook'u Binary Array / Blob formuna çevir
        const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Backend'in kabul edeceği yeni bir File objesi oluştur
        const remappedFile = new File([blob], file.name || 'mapped_import.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        // Backend'e çevrilmiş başlıklarla uyumlu dosyayı gönder
        this.validateExcelOnBackend(remappedFile);

      } catch (err) {
        this.toast.error(this.translate.instant('ExcelImport.AnalysisError'));
        this.isLoading.set(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  /**
   * Standard backend upload servisi (Ekstra headerMap göndermez, sadece uyumlu dosyayı post eder)
   */
  private validateExcelOnBackend(file: File) {
    this.isLoading.set(true);

    this.excelImportModalService.uploadExcel(this.validateEndpoint(), file)
      .subscribe({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const backendResult = event.body;
            if (backendResult && backendResult.isSuccess && backendResult.value) {
              this.validationResponse.set(backendResult);
              this.currentStep.set('preview');
            } else {
              this.toast.error(backendResult?.error?.message || this.translate.instant('ExcelImport.AnalysisError'));
            }
            this.isLoading.set(false);
          }
        },
        error: () => {
          this.toast.error(this.translate.instant('ExcelImport.AnalysisError'));
          this.isLoading.set(false);
        }
      });
  }

  onSaveBulkData() {
    const data = this.validationResponse(); 
    if (!data || data.value.hasError) {
      this.toast.error("Data Bulunamadı");
      return;
    }
    this.isLoading.set(true); 
    const payload = data.value?.rows?.map((r: any) => r.data) ?? []; 
    this.bulkCreate.emit({
      data: payload, 
      onSuccess: () => {
        this.closeModal();
        this.isLoading.set(false);
      },
      onError: () => {  
        this.isLoading.set(false);
      },
      onFinally: () => { 
        this.isLoading.set(false);
      }
    });
  }
}
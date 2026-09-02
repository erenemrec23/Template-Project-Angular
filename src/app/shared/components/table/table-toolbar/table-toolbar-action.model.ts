// shared/components/table/table-toolbar/table-toolbar-action.model.ts

/**
 * Toolbar'a soldan eklenen ekstra aksiyon butonu.
 * (table-row-actions'daki RowAction deseninin toolbar karşılığı.)
 */
export interface ToolbarAction {
  label?: string;                        // i18n anahtarı (translate edilir)
  icon?: string;                        // ör. 'bi-shield-plus'
  routerLink?: any[] | string;          // link aksiyonu
  queryParams?: Record<string, any>;    // routerLink ile birlikte
  onClick?: () => void;                 // buton aksiyonu
  visible?: boolean | (() => boolean);  // görünürlük (fonksiyon da olabilir; varsayılan true)
  variantClass?: string;                // app-shared-button varyant sınıfı
  tooltipText?: string;                 // i18n anahtarı; verilmezse label kullanılır

}
export interface RowAction {
  /** bootstrap-icons class, örn: 'bi-eye' */
  icon: string;
  /** Görünecek metin ya da translate key */
  label: string;
  /** routerLink verilirse <a>, verilmezse (click) ile <button> render edilir */
  routerLink?: any[] | string;
  /** routerLink yoksa çalışacak fonksiyon */
  onClick?: () => void;
  /** true/false ya da fonksiyon dönebilir, permission kontrolü için */
  visible?: boolean | (() => boolean);
  /** opsiyonel: renk override etmek istersen (default: gray/indigo hover) */
  colorClass?: string;
}
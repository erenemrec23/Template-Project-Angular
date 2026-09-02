// 1. Backend'den Dönecek Olan Sayfalama Modeli
export interface Paginate<T> {
  items: T[];
  index: number;
  pageSize: number;
  totalFilteredItemCount: number;
  totalItemCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
export interface GlobalSearchDto {
  fields: string[];
  value: string;
}
// 2. Senin Angular'dan Göndereceğin İstek Modeli
export interface PageRequestBaseDto {
  pageIndex: number;
  pageSize: number;
  dynamicFilterAndSort?: DynamicQueryDto | null;
  globalSearch?: GlobalSearchDto | null; 
}

export interface DynamicQueryDto {
  sort?: DynamicQuerySortDto[] | null;
  filter?: DynamicQueryFilterDto | null;
}

export interface DynamicQuerySortDto {
  field: string;
  dir: string;  
}

export interface DynamicQueryFilterDto {
  field: string;
  operator: string;
  value?: string | null;
  logic?: string | null; // 'and' veya 'or'
  filters?: DynamicQueryFilterDto[] | null;
}
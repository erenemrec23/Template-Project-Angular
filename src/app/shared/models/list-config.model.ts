// shared/models/list-config.model.ts
export interface BaseFilterState {
  globalSearch: string;
  sortField: string;
  sortOrder: 'asc' | 'desc' | '';
}

export interface FilterFieldConfig {
  field: string;           
  valueKey: string;       
  conditionKey?: string;   
  defaultCondition?: string;  
  value2Key?: string; 
}

export interface IListService<TDto, TBulkDto = any> {
  getList(request: any): import('rxjs').Observable<any>; 
  getPassivedList?(request: any): import('rxjs').Observable<any>;
  deleteById(id: string | number): import('rxjs').Observable<any>;
  exportList?(request: any): import('rxjs').Observable<Blob>;
  exportSampleList(): import('rxjs').Observable<Blob>;
  bulkCreate?(data: TBulkDto): import('rxjs').Observable<any>;
  setActiveById?(id: string | number): import('rxjs').Observable<any>;
  bulkSetActiveByIds?(ids: string[]): import('rxjs').Observable<any>;
}
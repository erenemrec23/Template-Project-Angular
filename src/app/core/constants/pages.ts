export interface PageConfig {
  pageKey: string;
  key: string; 
  icon: string;
  route?: string;
  exact?: boolean; 
  groupKey?: string;
}

export interface MenuGroupConfig {
  key: string;
  icon: string;
  children: PageConfig[];
}


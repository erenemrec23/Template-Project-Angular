
export interface PermissionOptionDto {
  label: string;
  value: number;
}


export const PagePermissions = { 
  View: 1,
  Insert: 2,
  Update: 4,
  SetPassive: 8,
  ViewPassive : 16,
  SetActive: 32,
  Delete: 64,
  ExportExcel: 128,
  ImportExcel: 256,
  ManagePagePermissions: 512
};


export const PERMISSION_OPTIONS: PermissionOptionDto[] = [
  { label: 'Permission.View', value: PagePermissions.View },
  { label: 'Permission.Insert', value: PagePermissions.Insert },
  { label: 'Permission.Update', value: PagePermissions.Update },
  { label: 'Permission.SetPassive', value: PagePermissions.SetPassive },
  { label: 'Permission.ViewPassive', value: PagePermissions.ViewPassive }, 
  { label: 'Permission.SetActive', value: PagePermissions.SetActive }, 
  { label: 'Permission.Delete', value: PagePermissions.Delete },
  { label: 'Permission.ExportExcel', value: PagePermissions.ExportExcel },
  { label: 'Permission.ImportExcel', value: PagePermissions.ImportExcel },
  { label: 'Permission.ManagePagePermissions', value: PagePermissions.ManagePagePermissions }
];
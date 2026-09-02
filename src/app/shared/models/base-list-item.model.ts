
export interface BaseListItemDto {
  createdDateTime : string;
  modifiedDateTime : string | null;
  modifiedUserFullName: string;
  createdUserFullName :string;
   
  revNum : number; 
}
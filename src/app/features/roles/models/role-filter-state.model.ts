
import { FilterConditionType } from "../../../core/constants/filter-condition.enum";
import { BaseFilterState } from "../../../shared/models/list-config.model";



export interface RoleFilterState extends BaseFilterState {
   nameCondition: FilterConditionType;
  nameValue: string;

  revNumCondition: FilterConditionType;
  revNumValue: number | null;

  createdDateCondition: FilterConditionType;
  createdDateValue: string | null; 
  createdDateValue2: string | null;

  
  createdUserFullNameCondition: FilterConditionType;
  createdUserFullNameValue: string;
  

  modifiedUserFullNameCondition: FilterConditionType;
  modifiedUserFullNameValue: string;

  modifiedDateCondition: FilterConditionType;
  modifiedDateValue: string | null; 
  modifiedDateValue2: string | null;
}
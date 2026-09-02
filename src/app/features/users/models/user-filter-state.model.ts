import { FilterConditionType } from "../../../core/constants/filter-condition.enum";
import { BaseFilterState } from "../../../shared/models/list-config.model";

// AppRole tarafindaki RoleFilterState ile ayni desen; sadece isim yerine
// firstName / lastName / email alan filtreleri var. Audit + revNum aynen korunuyor.
export interface UserFilterState extends BaseFilterState {
  firstNameCondition: FilterConditionType;
  firstNameValue: string;

  lastNameCondition: FilterConditionType;
  lastNameValue: string;

  emailCondition: FilterConditionType;
  emailValue: string;

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

import { BaseFilterState } from '../../../shared/models/list-config.model';
import { FilterConditionType } from '../../../core/constants/filter-condition.enum';

export interface QrLocationFilterState extends BaseFilterState {
  nameCondition: FilterConditionType;
  nameValue: string;

  startDateCondition: FilterConditionType;
  startDateValue: string | null;
  startDateValue2: string | null;

  endDateCondition: FilterConditionType;
  endDateValue: string | null;
  endDateValue2: string | null;

  locationNameCondition: FilterConditionType;
  locationNameValue: string;

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

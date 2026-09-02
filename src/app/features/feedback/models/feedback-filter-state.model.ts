import { BaseFilterState } from '../../../shared/models/list-config.model';
import { FilterConditionType } from '../../../core/constants/filter-condition.enum';

export interface FeedbackFilterState extends BaseFilterState {
  commentCondition: FilterConditionType;
  commentValue: string | null;
  
  pageUrlCondition: FilterConditionType;
  pageUrlValue: string | null;

  creatorEmailCondition: FilterConditionType;
  creatorEmailValue: string  | null;

  statusCondition: FilterConditionType;
  statusValue : number | null;

  createdDateCondition: FilterConditionType;
  createdDateValue: string | null;
  createdDateValue2 : string | null;
}
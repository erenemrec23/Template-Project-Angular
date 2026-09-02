export const FilterCondition = {
  Equals: 'eq',
  NotEquals: 'neq',
  GreaterThan: 'gt',
  GreaterThanOrEqual: 'gte',
  LessThan: 'lt',
  LessThanOrEqual: 'lte',
  StartsWith: 'startswith',
  EndsWith: 'endswith',
  Contains: 'contains',
  DoesNotContain: 'doesnotcontain',
  Between: 'between',
  IsEmpty: 'isempty',
  IsNotEmpty: 'isnotempty',
} as const;

export type FilterConditionType = typeof FilterCondition[keyof typeof FilterCondition];

// Metin (string) alanlarda gösterilecek koşullar
export const StringFilterConditions: FilterConditionType[] = [
  FilterCondition.Contains,
  FilterCondition.DoesNotContain,
  FilterCondition.Equals,
  FilterCondition.NotEquals,
  FilterCondition.StartsWith,
  FilterCondition.EndsWith,
  FilterCondition.IsEmpty,
  FilterCondition.IsNotEmpty,
];

// Sayısal alanlarda gösterilecek koşullar
export const NumberFilterConditions: FilterConditionType[] = [
  FilterCondition.Equals,
  FilterCondition.NotEquals,
  FilterCondition.GreaterThan,
  FilterCondition.GreaterThanOrEqual,
  FilterCondition.LessThan,
  FilterCondition.LessThanOrEqual,
  FilterCondition.IsEmpty,
  FilterCondition.IsNotEmpty,
];

// Tarih alanlarında gösterilecek koşullar
// GreaterThan/LessThan "After"/"Before" anlamına gelir, Between ise tarih aralığı seçimini
// (iki input) tetikler.
export const DateFilterConditions: FilterConditionType[] = [
  FilterCondition.Equals,
  FilterCondition.NotEquals,
  FilterCondition.GreaterThan,
  FilterCondition.GreaterThanOrEqual,
  FilterCondition.LessThan,
  FilterCondition.LessThanOrEqual,
  FilterCondition.Between,
  FilterCondition.IsEmpty,
  FilterCondition.IsNotEmpty,
];

// Value → çeviri anahtarı eşlemesi (select option label'ları için)
export const FilterConditionLabelKey: Record<FilterConditionType, string> = {
  [FilterCondition.Equals]: 'Label.Equals',
  [FilterCondition.NotEquals]: 'Label.NotEquals',
  [FilterCondition.GreaterThan]: 'Label.GreaterThan',
  [FilterCondition.GreaterThanOrEqual]: 'Label.GreaterThanOrEqual',
  [FilterCondition.LessThan]: 'Label.LessThan',
  [FilterCondition.LessThanOrEqual]: 'Label.LessThanOrEqual',
  [FilterCondition.StartsWith]: 'Label.StartsWith',
  [FilterCondition.EndsWith]: 'Label.EndsWith',
  [FilterCondition.Contains]: 'Label.Contains',
  [FilterCondition.DoesNotContain]: 'Label.DoesNotContain',
  [FilterCondition.Between]: 'Label.Between',
  [FilterCondition.IsEmpty]: 'Label.IsEmpty',
  [FilterCondition.IsNotEmpty]: 'Label.IsNotEmpty',
};
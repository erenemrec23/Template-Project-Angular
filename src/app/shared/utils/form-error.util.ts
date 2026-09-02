import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

export const errorKeyMap: Record<string, string> = {
  required: 'Error.Required',
  minlength: 'Error.MinLength',
  maxlength: 'Error.MaxLength',
  pattern: 'Error.Pattern',
  email: 'Error.Email',
  min: 'Error.Min',
  max: 'Error.Max',
};

export function resolveErrorMessage(
  errors: Record<string, any> | null | undefined,
  translate: TranslateService
): string {
  if (!errors) return '';

  const firstErrorKey = Object.keys(errors)[0];
  const translationKey = errorKeyMap[firstErrorKey] ?? 'Error.Generic';
  const errorDetail = errors[firstErrorKey];
  const params = typeof errorDetail === 'object' ? errorDetail : undefined;

  return translate.instant(translationKey, params);
}

export interface InvalidFieldMessage {
  controlName: string;
  label: string;
  message: string;
}

export function getInvalidFieldMessages(
  form: FormGroup,
  translate: TranslateService,
  parentPath: string = ''
): InvalidFieldMessage[] {
  const result: InvalidFieldMessage[] = [];

  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    const path = parentPath ? `${parentPath}.${key}` : key;
    if (!control) return;

    if (control instanceof FormGroup) {
      result.push(...getInvalidFieldMessages(control, translate, path));
      return;
    }

    if (control.invalid) {
      // YENİ: label artık dışarıdan map olarak değil, control üzerinden okunuyor
      const labelKey = (control as any)._labelKey as string | undefined;
      const label = labelKey ? translate.instant(labelKey) : path;
      const message = resolveErrorMessage(control.errors, translate);
      result.push({ controlName: path, label, message });
    }
  });

  return result;
}

export function buildCombinedErrorMessage(fields: InvalidFieldMessage[]): string {
  return fields.map(f => `• ${f.label}: ${f.message}`).join('\n');
}
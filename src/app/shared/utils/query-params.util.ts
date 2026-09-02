import { Params } from '@angular/router';

/**
 * Bir state objesini query string'e uygun Params objesine çevirir.
 * null/undefined/''/default değerler URL'i kirletmesin diye elenir.
 */
export function toQueryParams(
  state: Record<string, any>,
  defaults: Record<string, any> = {}
): Params {
  const params: Params = {};

  Object.keys(state).forEach(key => {
    const value = state[key];

    if (value === null || value === undefined || value === '') return;
    if (defaults[key] !== undefined && defaults[key] === value) return;

    params[key] = String(value);
  });

  return params;
}

/**
 * URL'deki query params'ı, verilen default state objesiyle merge eder.
 * Tip dönüşümü default değerin tipine bakarak otomatik yapılır.
 * default değer null olan alanlarda (örn. revNumValue: null), sayısal
 * bir string geldiyse number'a, gelmediyse string'e çevrilir.
 */
export function mergeQueryParamsWithDefaults<T extends Record<string, any>>(
  queryParams: Params,
  defaults: T
): T {
  const result: any = { ...defaults };

  Object.keys(queryParams).forEach(key => {
    if (!(key in defaults)) return; // tanımadığımız param'ı yoksay

    const rawValue = queryParams[key];
    const defaultValue = defaults[key];

    if (typeof defaultValue === 'number') {
      const num = Number(rawValue);
      if (!isNaN(num)) result[key] = num;
    } else if (typeof defaultValue === 'boolean') {
      result[key] = rawValue === 'true';
    } else if (defaultValue === null) {
      // default null olan alanlar (örn. sayısal filtre value'ları) — sayı ise number, değilse string
      const num = Number(rawValue);
      result[key] = rawValue !== '' && !isNaN(num) ? num : rawValue;
    } else {
      result[key] = rawValue;
    }
  });

  return result as T;
}
// core/http-context/error-handling.context.ts
import { HttpContext, HttpContextToken } from '@angular/common/http';

/** true ise errorInterceptor modal göstermez, hatayı çağırana bırakır */
export const HANDLE_ERROR_LOCALLY = new HttpContextToken<boolean>(() => false);

export const handleErrorLocally = () =>
  new HttpContext().set(HANDLE_ERROR_LOCALLY, true);
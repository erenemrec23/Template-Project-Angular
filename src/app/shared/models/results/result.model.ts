 
export interface Error {
  code: string;
  message: string;
}

// models/result.model.ts
export interface Result<T> {
  value: T;  
  isSuccess: boolean;
  isFailure: boolean;
  error: Error |null;
}


// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}
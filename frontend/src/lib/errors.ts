import { AxiosError } from 'axios';

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as any;
    
    // FastAPI validation errors (422)
    if (err.response?.status === 422 && data?.detail) {
      if (Array.isArray(data.detail)) {
        // FastAPI validation error format
        return data.detail.map((e: any) => e.msg).join(', ');
      }
      return data.detail;
    }
    
    // Standard error format
    const detail = data?.detail;
    if (detail) return detail;
    
    // Fallback to message
    const message = data?.message;
    if (message) return message;
  }
  return fallback;
}

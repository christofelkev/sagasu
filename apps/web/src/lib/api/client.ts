/**
 * SAGASU Typed API Client abstraction
 * In Frontend-first / mock mode, connects reactively with in-memory / local stores.
 * In full production, this dispatches to Elysia HTTP backend at /api/v1/*.
 */

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

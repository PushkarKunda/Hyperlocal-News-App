export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Location Types (for dropdowns)
export interface State {
  id: string;
  name: string;
  code: string;
}

export interface District {
  id: string;
  name: string;
  stateId: string;
  code?: string;
}

export interface City {
  id: string;
  name: string;
  districtId: string;
}

// Language Types
export interface Language {
  id: string;
  code?: string;
  name: string;
  nativeName?: string;
  isRTL?: boolean;
  glyph?: string;
}

// Interest/Topic Types
export interface Interest {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  description?: string;
}
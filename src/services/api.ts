// Export all API modules
export * from './api/properties.api';
export * from './api/services.api';
export * from './api/bookings.api';
export * from './api/users.api';
export * from './api/notifications.api';
export * from './api/dashboard.api';
export * from './api/media.api';
export * from './api/advertisements.api';

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export function isApiError(error: unknown): error is ApiError {
  if (typeof error !== 'object' || error === null) return false;

  if (!('message' in error) || typeof (error as ApiError).message !== 'string') return false;

  if ('errors' in error) {
    const apiError = error as ApiError;
    if (!Array.isArray(apiError.errors)) return false;

    return apiError.errors.every(
      (err) =>
        typeof err === 'object' &&
        err !== null &&
        'field' in err &&
        'message' in err &&
        typeof err.field === 'string' &&
        typeof err.message === 'string'
    );
  }

  return true;
}
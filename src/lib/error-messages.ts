/**
 * Turn API/server errors into clear, user-friendly messages.
 * Use everywhere we show errors to the user (toast, setError, etc.).
 */

function getMessageFromError(error: any): string | undefined {
  if (!error) return undefined;
  const data = error.response?.data;
  if (!data) return error.message;
  const msg = data.message;
  if (Array.isArray(msg)) return msg.join(' ');
  if (typeof msg === 'string') return msg;
  return data.error || error.message;
}

/** Known backend messages we want to keep or rephrase for clarity */
const MESSAGE_MAP: Record<string, string> = {
  'File size exceeds 10MB limit':
    'This image is too large. Maximum size is 10MB per file. Please choose a smaller image or compress it.',
  'This file is too large. Maximum size is 10MB per file. Please choose a smaller image or compress it.':
    'This image is too large. Maximum size is 10MB per file. Please choose a smaller image or compress it.',
  'Invalid file type':
    'This file type is not allowed. Please use JPG, PNG, GIF, WebP, or PDF.',
  'This file type is not allowed. Please use JPG, PNG, GIF, WebP, PDF, or MP4.':
    'This file type is not allowed. Please use JPG, PNG, GIF, WebP, or PDF.',
  'No file provided':
    'Please select a file to upload.',
  'No file provided. Please select a file to upload.':
    'Please select a file to upload.',
  'No files provided':
    'Please select at least one file to upload.',
};

/** Status-code based fallbacks when message is generic */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Your request could not be processed. Please check your input and try again.',
  401: 'Please sign in again to continue.',
  403: "You don't have permission to do this.",
  404: 'The item was not found. It may have been removed.',
  413: 'The file is too large. Maximum size is 10MB per file. Please choose a smaller image.',
  422: 'The information you entered is invalid. Please check and try again.',
  500: 'Something went wrong on our end. Please try again in a moment.',
};

/**
 * Returns a clear, user-friendly error message for display (toast, form error, etc.).
 * @param error - Caught error (e.g. from axios / API call)
 * @param fallback - Message to show when we can't derive a better one
 */
export function getUserFriendlyErrorMessage(
  error: any,
  fallback: string = 'Something went wrong. Please try again.',
): string {
  const status = error?.response?.status;
  const raw = getMessageFromError(error);

  if (raw && MESSAGE_MAP[raw]) return MESSAGE_MAP[raw];
  if (raw && raw.trim().length > 0) return raw;

  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (error?.message && typeof error.message === 'string') return error.message;

  return fallback;
}

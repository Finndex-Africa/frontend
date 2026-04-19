/**
 * Set `NEXT_PUBLIC_DEBUG_PRESERVE_NETWORK=true` in `.env.local` while debugging auth / 401s.
 * When enabled:
 * - No full-page redirect on logout (AuthService) so DevTools Network isn’t cleared by navigation
 * - No automatic logout + redirect on 401 (apiClient + AuthService interceptors; refresh 401 too)
 *
 * After debugging, remove the env var or set it to false.
 */
export const DEBUG_PRESERVE_NETWORK: boolean =
    process.env.NEXT_PUBLIC_DEBUG_PRESERVE_NETWORK === "true" ||
    process.env.NEXT_PUBLIC_DEBUG_PRESERVE_NETWORK === "1";

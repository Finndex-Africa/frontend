import axios from 'axios';
import message from 'antd/es/message';
// Small JWT decoder (avoids depending on `jwt-decode` default export which can cause bundler issues).
function decodeJwt(token: string): any | null {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        let json = '';
        if (typeof window === 'undefined') {
            // Node / SSR
            json = Buffer.from(b64, 'base64').toString('utf8');
        } else {
            // Browser
            const str = atob(b64);
            json = decodeURIComponent(
                Array.prototype.map
                    .call(str, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join(''),
            );
        }
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}
import { logDebug, logError, logInfo } from '@/utils/persistentLogger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface IJwtPayload {
    user: IUser;
    exp: number;
    iat: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}

export class AuthService {
    private static instance: AuthService;
    private token: string | null = null;
    private constructor() {
        // Initialize token from localStorage if it exists
        if (typeof window !== 'undefined') {
            try {
                // Prefer persistent token, but fall back to session token
                this.token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token');
                // Validate stored user data
                const user = this.getUser();
                if (!user) {
                    // If user data is invalid, clear authentication
                    this.token = null;
                    window.localStorage.removeItem('token');
                    window.sessionStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Error initializing auth service:', error);
                this.token = null;
            }
        }
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async login(credentials: LoginCredentials, rememberMe: boolean = true): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(
                `${API_URL}/auth/login`,
                { ...credentials, rememberMe }
            );

            const { token, user } = response.data;

            if (typeof window !== 'undefined') {
                // Use consistent storage: localStorage for persistent, sessionStorage for session-only
                if (rememberMe) {
                    window.localStorage.setItem('token', token);
                    window.localStorage.setItem('user', JSON.stringify(user));
                } else {
                    window.sessionStorage.setItem('token', token);
                    window.sessionStorage.setItem('user', JSON.stringify(user));
                }

                // Clean up any legacy authToken keys
                window.localStorage.removeItem('authToken');
                window.sessionStorage.removeItem('authToken');
            }
            this.token = token;

            // Set up axios interceptors immediately after successful login
            this.setupAxiosInterceptors();

            logInfo('AuthService: login successful', { rememberMe });

            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            message.error(errorMessage);
            logError('AuthService: login failed', { error: errorMessage });
            throw new Error(errorMessage);
        }
    }

    logout(reason: string = 'manual'): void {
        logInfo('AuthService: logout invoked', { reason, timestamp: new Date().toISOString() });
        console.warn(`[AUTH] Logging out - Reason: ${reason}`);
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        // Clear cookie
        if (typeof document !== 'undefined') {
            document.cookie = 'token=; path=/; max-age=0';
        }
        this.token = null;
        window.location.href = '/login';
    }

    getToken(): string | null {
        // Always check storage for the most up-to-date token
        // Use consistent 'token' key only
        if (typeof window !== 'undefined' && !this.token) {
            this.token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token');
        }
        return this.token;
    }

    async refreshToken(): Promise<{ token: string; user: IUser }> {
        try {
            const currentToken = this.getToken();
            if (!currentToken) {
                throw new Error('No token available to refresh');
            }

            const response = await axios.post<{ data: { token: string; user: IUser } }>(
                `${API_URL}/auth/refresh`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                    },
                }
            );

            const { token, user } = response.data.data;

            // Update stored token and user with consistent storage strategy
            if (typeof window !== 'undefined') {
                // Check which storage was used and keep using the same
                const useLocalStorage = window.localStorage.getItem('token') !== null;

                if (useLocalStorage) {
                    window.localStorage.setItem('token', token);
                    window.localStorage.setItem('user', JSON.stringify(user));
                } else {
                    window.sessionStorage.setItem('token', token);
                    window.sessionStorage.setItem('user', JSON.stringify(user));
                }

                // Clean up legacy authToken keys
                window.localStorage.removeItem('authToken');
                window.sessionStorage.removeItem('authToken');
            }

            this.token = token;
            logInfo('AuthService: token refreshed successfully');
            console.log('[AUTH] Token refreshed successfully');

            return { token, user };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Token refresh failed';
            logError('AuthService: token refresh failed', { error: errorMessage });
            console.error('[AUTH] Token refresh failed:', errorMessage);

            // If refresh fails with 401, logout
            if (error.response?.status === 401) {
                this.logout('refresh_token_expired');
            }

            throw new Error(errorMessage);
        }
    }

    isAuthenticated(): boolean {
        return !!this.token;
    }

    public getUser(): IUser | null {
        if (typeof window === 'undefined') return null;

        try {
            // Prefer stored user object in localStorage, then sessionStorage (set at login)
            const storedUser = window.localStorage.getItem('user') || window.sessionStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser) as IUser;
                    if (parsed && parsed.email) return parsed;
                } catch (err) {
                    logDebug('AuthService: failed to parse stored user, will decode token', { err: String(err) });
                    // fallthrough to token decoding
                }
            }

            const token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token');
            if (!token) return null;

            // Decode token and reconstruct a minimal user if possible
            const decodedToken = decodeJwt(token) as any;

            // Check expiry
            const currentTime = Date.now() / 1000;
            if (decodedToken && decodedToken.exp && decodedToken.exp < currentTime) {
                const expiredTime = new Date(decodedToken.exp * 1000).toISOString();
                logInfo('AuthService: token expired - clearing storage', { exp: decodedToken.exp, expiredTime, now: currentTime });
                console.warn(`[AUTH] Token expired at ${expiredTime}. Clearing storage.`);
                window.localStorage.removeItem('token');
                window.localStorage.removeItem('authToken');
                window.localStorage.removeItem('user');
                window.sessionStorage.removeItem('token');
                window.sessionStorage.removeItem('authToken');
                window.sessionStorage.removeItem('user');
                return null;
            }

            // Backend signs tokens with sub/email/userType. Reconstruct user from claims.
            if (decodedToken) {
                const reconstructed: Partial<IUser> = {};
                if (decodedToken.sub) reconstructed.id = decodedToken.sub;
                if (decodedToken.email) reconstructed.email = decodedToken.email;
                if (decodedToken.userType) reconstructed.role = decodedToken.userType;
                // Return only if we have at least an email or id
                if (reconstructed.email || reconstructed.id) {
                    logDebug('AuthService: reconstructed user from token', { reconstructed });
                    return reconstructed as IUser;
                }
            }

            return null;
        } catch (error) {
            console.error('Error getting user data:', error);
            // Clear invalid token
            window.localStorage.removeItem('token');
            return null;
        }
    }

    // Add axios interceptor to add token to requests
    setupAxiosInterceptors(): void {
        axios.interceptors.request.use(
            (config) => {
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                try {
                    const status = error.response?.status;
                    const url = error.config?.url;
                    logError('AuthService: axios response error', { status, url, message: error.message });
                    if (status === 401) {
                        // In local development, avoid auto-logout so we can inspect the failing request
                        try {
                            const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) || '';
                            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                                logInfo('AuthService: detected 401 response but skipping auto-logout on localhost', { url });
                                console.warn(`[AUTH] 401 Unauthorized on ${url} - auto-logout skipped (localhost)`);
                            } else {
                                logInfo('AuthService: detected 401 response, invoking logout', { url });
                                console.warn(`[AUTH] 401 Unauthorized on ${url} - triggering auto-logout`);
                                this.logout('401_unauthorized');
                            }
                        } catch (e) {
                            // Fallback to logout if check fails
                            this.logout('401_unauthorized_fallback');
                        }
                    }
                } catch (e) {
                    // ignore logging failures
                }
                return Promise.reject(error);
            }
        );
    }
}
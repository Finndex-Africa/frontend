import { apiClient } from '@/lib/api-client';

export interface VerifyEmailResponse {
    message: string;
}

export const authService = {
    // Verify email with token
    verifyEmail: async (token: string) => {
        return apiClient.get<VerifyEmailResponse>(`/auth/verify-email?token=${token}`);
    },
};

import { apiClient } from '@/lib/api-client';

export interface IdVerification {
    _id: string;
    userId: string;
    idType: 'passport' | 'national_id' | 'drivers_license' | 'voters_card';
    idNumber: string;
    idFrontImage: string;
    idBackImage?: string;
    selfieImage?: string;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    rejectionReason?: string;
    createdAt: string;
}

export interface SubmitIdVerificationDto {
    idType: string;
    idNumber: string;
    idFrontImage: string;
    idBackImage?: string;
    selfieImage?: string;
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    expiryDate?: string;
}

export const verificationApi = {
    submit: async (data: SubmitIdVerificationDto) => {
        return apiClient.post<IdVerification>('/verification/id', data);
    },

    getMyStatus: async () => {
        return apiClient.get<IdVerification | null>('/verification/id/my');
    },
};

import { apiClient } from '@/lib/api-client';

export type AgentApplicationGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type AgentApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface AgentApplication {
    _id: string;
    fullName: string;
    email: string;
    location: string;
    phone: string;
    gender: AgentApplicationGender;
    status: AgentApplicationStatus;
    userId?: string;
    rejectionReason?: string;
    reviewNotes?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SubmitAgentApplicationDto {
    fullName: string;
    email: string;
    location: string;
    phone: string;
    gender: AgentApplicationGender;
}

export const agentApplicationsApi = {
    submit: async (data: SubmitAgentApplicationDto) => {
        return apiClient.post<AgentApplication>('/agent-applications', data);
    },

    getMyApplication: async () => {
        return apiClient.get<AgentApplication | null>('/agent-applications/my');
    },
};

/** E.164-style phone validation (+231886149241) */
export function isE164Phone(value: string): boolean {
    return /^\+[1-9]\d{6,14}$/.test(value.trim());
}

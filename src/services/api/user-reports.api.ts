import { apiClient } from '@/lib/api-client';

export type UserReportCategory =
    | 'fraud_scam'
    | 'fake_property_listing'
    | 'misinformation'
    | 'impersonation'
    | 'misconduct'
    | 'payment_issue'
    | 'other';

export interface UserReport {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    reportCategory: UserReportCategory;
    reportedTarget: string;
    userId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SubmitUserReportDto {
    fullName: string;
    email: string;
    phone: string;
    reportCategory: UserReportCategory;
    reportedTarget: string;
}

export const USER_REPORT_CATEGORIES: { value: UserReportCategory; label: string }[] = [
    { value: 'fraud_scam', label: 'Fraud/Scam' },
    { value: 'fake_property_listing', label: 'Fake Property Listing' },
    { value: 'misinformation', label: 'Misinformation' },
    { value: 'impersonation', label: 'Impersonation' },
    { value: 'misconduct', label: 'Misconduct' },
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'other', label: 'Other' },
];

export const userReportsApi = {
    submit: async (data: SubmitUserReportDto) => {
        return apiClient.post<UserReport>('/user-reports', data);
    },
};

/** E.164-style phone validation (+231886149241) */
export function isE164Phone(value: string): boolean {
    return /^\+[1-9]\d{6,14}$/.test(value.trim());
}

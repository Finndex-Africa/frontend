/**
 * Platform “verified” badge: admin approval only.
 * Requires `verificationStatus === 'verified'` from the API.
 */
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export function isUserVerifiedByAdmin(
    user: {
        verificationStatus?: string;
        verified?: boolean;
    } | null | undefined,
): boolean {
    if (!user) return false;
    return user.verificationStatus === 'verified';
}

/**
 * Platform "verified" badge: admin approval only.
 * Checks `verificationStatus === 'verified'` (admin panel) or `verified === true` (API boolean).
 */
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export function isUserVerifiedByAdmin(
    user: {
        verificationStatus?: string;
        verified?: boolean;
    } | null | undefined,
): boolean {
    if (!user) return false;
    return user.verificationStatus === 'verified' || user.verified === true;
}

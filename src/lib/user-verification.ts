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

/** ID verification from populated user on service provider profile (or session user). */
export function isUserIdVerified(
    user: { idVerified?: boolean } | null | undefined,
): boolean {
    return user?.idVerified === true;
}

export function getProviderProfileUser(
    provider: { userId?: string | { idVerified?: boolean } } | null | undefined,
    fallbackUser?: { idVerified?: boolean } | null | undefined,
): { idVerified?: boolean } | null | undefined {
    if (provider?.userId && typeof provider.userId === 'object') {
        return provider.userId;
    }
    return fallbackUser;
}

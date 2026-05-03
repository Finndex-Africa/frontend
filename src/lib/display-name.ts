/** Best-effort display name from API user objects (avoids showing email when a real name exists). */
export function getUserDisplayName(
    user: Record<string, unknown> | null | undefined,
    emailFallback = '',
): string {
    if (!user || typeof user !== 'object') {
        return emailFallback || 'Member';
    }
    const u = user as Record<string, unknown>;
    for (const key of ['fullName', 'name', 'displayName', 'legalName'] as const) {
        const v = u[key];
        if (typeof v === 'string' && v.trim()) return v.trim();
    }
    const first = typeof u.firstName === 'string' ? u.firstName.trim() : '';
    const last = typeof u.lastName === 'string' ? u.lastName.trim() : '';
    const composed = [first, last].filter(Boolean).join(' ').trim();
    if (composed) return composed;
    const biz = typeof u.businessName === 'string' ? u.businessName.trim() : '';
    if (biz) return biz;
    const email = typeof u.email === 'string' ? u.email.trim() : '';
    return email || emailFallback || 'Member';
}

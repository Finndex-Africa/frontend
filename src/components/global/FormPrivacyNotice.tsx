'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

/**
 * Shown on forms that collect contact details.
 *
 * These forms exist so we can reply, so the lawful basis is the request itself
 * rather than consent; what is owed is a clear statement of what happens to the
 * data. A blocking checkbox here would be consent theatre, since declining and
 * still submitting is incoherent. Account signup is different and does use a
 * real checkbox.
 */
export default function FormPrivacyNotice({ className = '' }: { className?: string }) {
    const t = useTranslations('forms');

    return (
        <p className={`text-xs text-gray-500 leading-relaxed ${className}`}>
            {t('privacyNoticePre')}{' '}
            <Link
                href="/routes/privacy"
                className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
            >
                {t('privacyNoticeLink')}
            </Link>
            {t('privacyNoticePost')}
        </p>
    );
}

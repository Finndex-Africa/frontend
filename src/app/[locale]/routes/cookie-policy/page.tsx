import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
    BulletList,
    LegalContactCard,
    LegalDocLayout,
    LegalSection,
    LegalTranslationNotice,
    PolicyTable,
} from '@/components/legal/LegalDocLayout';

import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('cookiePolicyPage');
    return {
        title: t('title'),
        description: t('subtitle'),
    };
}

export default async function CookiePolicyPage() {
    const t = await getTranslations('cookiePolicyPage');
    const tLegal = await getTranslations('legal');
    const s = t.raw('s') as Record<string, Record<string, string | string[] | string[][]>>;
    const str = (path: string, key: string) => s[path][key] as string;
    const list = (path: string, key: string) => s[path][key] as string[];
    const rows = (path: string) => s[path].rows as string[][];
    const headers = (path: string) => s[path].headers as string[];

    return (
        <LegalDocLayout title={t('title')} subtitle={t('subtitle')}>
            <LegalTranslationNotice notice={tLegal('translationNotice')} />

            <p className="text-sm text-gray-500">{t('lastUpdated')}</p>

            <LegalSection title={str('intro', 't')}>
                <p>
                    {str('intro', 'p1')}{' '}
                    <Link href="/routes/privacy" className="text-[#0000FF] font-medium hover:underline">
                        {str('intro', 'link')}
                    </Link>
                    {str('intro', 'p2')}
                </p>
            </LegalSection>

            <LegalSection title={str('what', 't')}>
                <p>{str('what', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('necessary', 't')}>
                <p>{str('necessary', 'p1')}</p>
                <PolicyTable headers={headers('necessary')} rows={rows('necessary')} />
            </LegalSection>

            <LegalSection title={str('preferences', 't')}>
                <p>{str('preferences', 'p1')}</p>
                <PolicyTable headers={headers('preferences')} rows={rows('preferences')} />
            </LegalSection>

            <LegalSection title={str('analytics', 't')}>
                <p>{str('analytics', 'p1')}</p>
                <PolicyTable headers={headers('analytics')} rows={rows('analytics')} />
            </LegalSection>

            <LegalSection title={str('marketing', 't')}>
                <p>{str('marketing', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('errors', 't')}>
                <p>{str('errors', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('embeds', 't')}>
                <p>{str('embeds', 'p1')}</p>
                <BulletList items={list('embeds', 'items')} />
            </LegalSection>

            <LegalSection title={str('changing', 't')}>
                <p>{str('changing', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('changes', 't')}>
                <p>{str('changes', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('contact', 't')}>
                <p>
                    {str('contact', 'p1')}{' '}
                    <a href="mailto:info@findafriq.com" className="text-[#0000FF] font-medium hover:underline">
                        info@findafriq.com
                    </a>
                </p>
            </LegalSection>

            <LegalContactCard />
        </LegalDocLayout>
    );
}

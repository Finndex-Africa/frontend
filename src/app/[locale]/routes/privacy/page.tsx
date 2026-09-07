import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
    BulletList,
    LegalContactCard,
    LegalDocLayout,
    LegalSection,
    LegalSubheading,
    LegalTranslationNotice,
} from '@/components/legal/LegalDocLayout';

import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('privacyPage');
    return {
        title: t('title'),
        description: t('subtitle'),
    };
}

export default async function PrivacyPolicyPage() {
    const t = await getTranslations('privacyPage');
    const tLegal = await getTranslations('legal');
    const s = t.raw('s') as Record<string, Record<string, string | string[]>>;
    const str = (path: string, key: string) => s[path][key] as string;
    const list = (path: string, key: string) => s[path][key] as string[];

    return (
        <LegalDocLayout title={t('title')} subtitle={t('subtitle')}>
            <LegalTranslationNotice notice={tLegal('translationNotice')} />

            <LegalSection title={str('intro', 't')}>
                <p>
                    {str('intro', 'p1')}{' '}
                    <Link href="/routes/terms" className="text-[#0000FF] font-medium hover:underline">
                        {str('intro', 'link')}
                    </Link>
                    {str('intro', 'p2')}
                </p>
            </LegalSection>

            <LegalSection title={str('collect', 't')}>
                <LegalSubheading>{str('collect', 'h1')}</LegalSubheading>
                <BulletList items={list('collect', 'i1')} />
                <LegalSubheading>{str('collect', 'h2')}</LegalSubheading>
                <BulletList items={list('collect', 'i2')} />
            </LegalSection>

            <LegalSection title={str('use', 't')}>
                <BulletList items={list('use', 'items')} />
            </LegalSection>

            <LegalSection title={str('bases', 't')}>
                <p>{str('bases', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('sharing', 't')}>
                <p>{str('sharing', 'p1')}</p>
                <BulletList items={list('sharing', 'items')} />
            </LegalSection>

            <LegalSection title={str('transfers', 't')}>
                <p>{str('transfers', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('retention', 't')}>
                <p>{str('retention', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('security', 't')}>
                <p>{str('security', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('rights', 't')}>
                <p>{str('rights', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('cookies', 't')}>
                <p>{str('cookies', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('children', 't')}>
                <p>{str('children', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('thirdParty', 't')}>
                <p>{str('thirdParty', 'p1')}</p>
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

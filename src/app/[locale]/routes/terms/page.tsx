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
    const t = await getTranslations('termsPage');
    return {
        title: t('title'),
        description: t('subtitle'),
    };
}

export default async function TermsPage() {
    const t = await getTranslations('termsPage');
    const tLegal = await getTranslations('legal');
    // Section copy lives in messages/*.json under termsPage.s
    const s = t.raw('s') as Record<string, Record<string, string | string[]>>;
    const str = (path: string, key: string) => s[path][key] as string;
    const list = (path: string, key: string) => s[path][key] as string[];

    return (
        <LegalDocLayout title={t('title')} subtitle={t('subtitle')}>
            <LegalTranslationNotice notice={tLegal('translationNotice')} />

            <LegalSection title={str('intro', 't')}>
                <p>{str('intro', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('about', 't')}>
                <p>{str('about', 'p1')}</p>
                <BulletList items={list('about', 'items')} />
                <p>{str('about', 'p2')}</p>
            </LegalSection>

            <LegalSection title={str('eligibility', 't')}>
                <p>{str('eligibility', 'p1')}</p>
                <BulletList items={list('eligibility', 'items')} />
            </LegalSection>

            <LegalSection title={str('categories', 't')}>
                <LegalSubheading>{str('categories', 'a')}</LegalSubheading>
                <BulletList items={list('categories', 'aItems')} />
                <LegalSubheading>{str('categories', 'b')}</LegalSubheading>
                <BulletList items={list('categories', 'bItems')} />
                <LegalSubheading>{str('categories', 'c')}</LegalSubheading>
                <BulletList items={list('categories', 'cItems')} />
            </LegalSection>

            <LegalSection title={str('pricing', 't')}>
                <LegalSubheading>{str('pricing', 'h1')}</LegalSubheading>
                <BulletList items={list('pricing', 'i1')} />
                <LegalSubheading>{str('pricing', 'h2')}</LegalSubheading>
                <BulletList items={list('pricing', 'i2')} />
                <LegalSubheading>{str('pricing', 'h3')}</LegalSubheading>
                <BulletList items={list('pricing', 'i3')} />
                <p className="text-sm text-gray-600">
                    {str('pricing', 'detailsLabel')}{' '}
                    <Link href="/routes/pricing" className="text-[#0000FF] font-medium hover:underline">
                        {str('pricing', 'pricingLink')}
                    </Link>
                    .
                </p>
            </LegalSection>

            <LegalSection title={str('role', 't')}>
                <p>{str('role', 'p1')}</p>
                <BulletList items={list('role', 'items')} />
            </LegalSection>

            <LegalSection title={str('responsibilities', 't')}>
                <p>{str('responsibilities', 'p1')}</p>
                <BulletList items={list('responsibilities', 'items')} />
                <p className="font-medium text-gray-900">{str('responsibilities', 'p2')}</p>
                <BulletList items={list('responsibilities', 'items2')} />
            </LegalSection>

            <LegalSection title={str('verification', 't')}>
                <p>{str('verification', 'p1')}</p>
                <BulletList items={list('verification', 'items')} />
            </LegalSection>

            <LegalSection title={str('listings', 't')}>
                <p>{str('listings', 'p1')}</p>
                <BulletList items={list('listings', 'items')} />
                <p>{str('listings', 'p2')}</p>
                <BulletList items={list('listings', 'items2')} />
            </LegalSection>

            <LegalSection title={str('transactions', 't')}>
                <BulletList items={list('transactions', 'items')} />
            </LegalSection>

            <LegalSection title={str('termination', 't')}>
                <p>{str('termination', 'p1')}</p>
                <BulletList items={list('termination', 'items')} />
                <p>{str('termination', 'p2')}</p>
            </LegalSection>

            <LegalSection title={str('liability', 't')}>
                <p>{str('liability', 'p1')}</p>
                <BulletList items={list('liability', 'items')} />
            </LegalSection>

            <LegalSection title={str('privacy', 't')}>
                <p>
                    {str('privacy', 'p1')}{' '}
                    <Link href="/routes/privacy" className="text-[#0000FF] font-medium hover:underline">
                        {str('privacy', 'link')}
                    </Link>
                    {str('privacy', 'p2')}
                </p>
            </LegalSection>

            <LegalSection title={str('ip', 't')}>
                <p>{str('ip', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('modifications', 't')}>
                <p>{str('modifications', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('law', 't')}>
                <p>{str('law', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('contact', 't')}>
                <p>{str('contact', 'p1')}</p>
                <p className="font-semibold text-gray-900">FindAfriq</p>
                <ul className="list-none space-y-1 text-gray-700 pl-0">
                    <li>
                        {str('contact', 'email')}{' '}
                        <a href="mailto:info@findafriq.com" className="text-[#0000FF] font-medium hover:underline">
                            info@findafriq.com
                        </a>
                    </li>
                    <li>
                        {str('contact', 'website')}{' '}
                        <a href="https://www.findafriq.com" className="text-[#0000FF] font-medium hover:underline">
                            www.findafriq.com
                        </a>
                    </li>
                    <li>{str('contact', 'phone')}</li>
                </ul>
            </LegalSection>

            <LegalSection title={str('acceptance', 't')}>
                <p>{str('acceptance', 'p1')}</p>
            </LegalSection>

            <div className="flex flex-wrap gap-3 text-sm">
                <Link
                    href="/routes/platform-policy"
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                >
                    {t('platformPolicyLink')}
                </Link>
                <Link
                    href="/routes/privacy"
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                >
                    {t('privacyPolicyLink')}
                </Link>
            </div>

            <LegalContactCard />
        </LegalDocLayout>
    );
}

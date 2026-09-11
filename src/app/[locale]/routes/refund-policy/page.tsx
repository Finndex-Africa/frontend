import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
    BulletList,
    LegalContactCard,
    LegalDocLayout,
    LegalSection,
    LegalTranslationNotice,
} from '@/components/legal/LegalDocLayout';


export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('refundPolicyPage');
    return {
        title: t('title'),
        description: t('subtitle'),
    };
}

export default async function RefundPolicyPage() {
    const t = await getTranslations('refundPolicyPage');
    const tLegal = await getTranslations('legal');
    const s = t.raw('s') as Record<string, Record<string, string | string[]>>;
    const str = (path: string, key: string) => s[path][key] as string;
    const list = (path: string, key: string) => s[path][key] as string[];

    return (
        <LegalDocLayout title={t('title')} subtitle={t('subtitle')}>
            <LegalTranslationNotice notice={tLegal('translationNotice')} />

            <p className="text-sm text-gray-500">{t('lastUpdated')}</p>

            {/*
              Payments are not live yet (see pricingPage.paymentComingSoon), so
              this leads with that rather than implying anyone can be charged
              today. Remove this callout when billing opens.
            */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {str('status', 'p1')}
            </div>

            <LegalSection title={str('scope', 't')}>
                <p>{str('scope', 'p1')}</p>
                <p>{str('scope', 'p2')}</p>
            </LegalSection>

            <LegalSection title={str('billing', 't')}>
                <BulletList items={list('billing', 'items')} />
            </LegalSection>

            <LegalSection title={str('cooling', 't')}>
                <p>{str('cooling', 'p1')}</p>
                <p>{str('cooling', 'p2')}</p>
            </LegalSection>

            <LegalSection title={str('renewals', 't')}>
                <p>{str('renewals', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('cancel', 't')}>
                <p>{str('cancel', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('ours', 't')}>
                <p>{str('ours', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('how', 't')}>
                <p>{str('how', 'p1')}</p>
                <p>{str('how', 'p2')}</p>
            </LegalSection>

            <LegalSection title={str('disputes', 't')}>
                <p>{str('disputes', 'p1')}</p>
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

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
    BulletList,
    LegalContactCard,
    LegalDocLayout,
    LegalSection,
    LegalSubheading,
    LegalTranslationNotice,
    PolicyTable,
} from '@/components/legal/LegalDocLayout';

import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('platformPolicyPage');
    return {
        title: t('title'),
        description: t('subtitle'),
    };
}

export default async function PlatformPolicyPage() {
    const t = await getTranslations('platformPolicyPage');
    const tLegal = await getTranslations('legal');
    const s = t.raw('s') as Record<
        string,
        Record<string, string | string[] | string[][]>
    >;
    const str = (path: string, key: string) => s[path][key] as string;
    const list = (path: string, key: string) => s[path][key] as string[];
    const rows = (path: string, key: string) => s[path][key] as string[][];

    return (
        <LegalDocLayout title={t('title')} subtitle={t('subtitle')}>
            <LegalTranslationNotice notice={tLegal('translationNotice')} />

            <LegalSection title={str('purpose', 't')}>
                <p>{str('purpose', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('scope', 't')}>
                <p>{str('scope', 'p1')}</p>
                <BulletList items={list('scope', 'items')} />
            </LegalSection>

            <LegalSection title={str('principles', 't')}>
                <p>{str('principles', 'p1')}</p>
                <BulletList items={list('principles', 'items')} />
            </LegalSection>

            <LegalSection title={str('prohibited', 't')}>
                <p>{str('prohibited', 'p1')}</p>

                <LegalSubheading>{str('prohibited', 'h1')}</LegalSubheading>
                <BulletList items={list('prohibited', 'i1')} />

                <LegalSubheading>{str('prohibited', 'h2')}</LegalSubheading>
                <BulletList items={list('prohibited', 'i2')} />

                <LegalSubheading>{str('prohibited', 'h3')}</LegalSubheading>
                <BulletList items={list('prohibited', 'i3')} />

                <LegalSubheading>{str('prohibited', 'h4')}</LegalSubheading>
                <BulletList items={list('prohibited', 'i4')} />
            </LegalSection>

            <LegalSection title={str('enforcement', 't')}>
                <p>{str('enforcement', 'p1')}</p>
                <PolicyTable
                    headers={list('enforcement', 'headers')}
                    rows={rows('enforcement', 'rows')}
                />
            </LegalSection>

            <LegalSection title={str('penalties', 't')}>
                <LegalSubheading>{str('penalties', 'h1')}</LegalSubheading>
                <PolicyTable headers={list('penalties', 'headers')} rows={rows('penalties', 'r1')} />

                <LegalSubheading>{str('penalties', 'h2')}</LegalSubheading>
                <PolicyTable headers={list('penalties', 'headers')} rows={rows('penalties', 'r2')} />

                <LegalSubheading>{str('penalties', 'h3')}</LegalSubheading>
                <PolicyTable headers={list('penalties', 'headers')} rows={rows('penalties', 'r3')} />

                <LegalSubheading>{str('penalties', 'h4')}</LegalSubheading>
                <PolicyTable headers={list('penalties', 'headers')} rows={rows('penalties', 'r4')} />
            </LegalSection>

            <LegalSection title={str('financial', 't')}>
                <p>{str('financial', 'p1')}</p>
                <BulletList items={list('financial', 'items')} />
                <p className="text-sm text-gray-600">
                    {str('financial', 'seeAlso')}{' '}
                    <Link href="/routes/pricing" className="text-[#0000FF] font-medium hover:underline">
                        {str('financial', 'pricingLink')}
                    </Link>
                    .
                </p>
            </LegalSection>

            <LegalSection title={str('moderation', 't')}>
                <p>{str('moderation', 'p1')}</p>
                <BulletList items={list('moderation', 'items')} />
            </LegalSection>

            <LegalSection title={str('reporting', 't')}>
                <p>{str('reporting', 'p1')}</p>
                <BulletList items={list('reporting', 'items')} />
                <p className="font-medium text-gray-900">{str('reporting', 'p2')}</p>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                    {list('reporting', 'steps').map((step) => (
                        <li key={step}>{step}</li>
                    ))}
                </ol>
            </LegalSection>

            <LegalSection title={str('appeals', 't')}>
                <p>{str('appeals', 'p1')}</p>
                <BulletList items={list('appeals', 'items')} />
                <p>{str('appeals', 'p2')}</p>
            </LegalSection>

            <LegalSection title={str('suspension', 't')}>
                <p>{str('suspension', 'p1')}</p>
                <BulletList items={list('suspension', 'items')} />
            </LegalSection>

            <LegalSection title={str('legal', 't')}>
                <BulletList items={list('legal', 'items')} />
            </LegalSection>

            <LegalSection title={str('updates', 't')}>
                <p>{str('updates', 'p1')}</p>
            </LegalSection>

            <LegalSection title={str('conclusion', 't')}>
                <p>{str('conclusion', 'p1')}</p>
                <BulletList items={list('conclusion', 'items')} />
            </LegalSection>

            <LegalContactCard />
        </LegalDocLayout>
    );
}

import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('pricingPage');
    return {
        title: t('comingSoonTitle'),
        description: t('comingSoonBody'),
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function PricingPage() {
    const t = await getTranslations('pricingPage');
    const tCommon = await getTranslations('common');

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
            <div className="max-w-lg text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('comingSoonTitle')}</h1>
                <p className="text-gray-600 leading-relaxed mb-8">
                    {t('comingSoonBody')}
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition"
                >
                    {tCommon('backToHome')}
                </Link>
            </div>
        </div>
    );
}

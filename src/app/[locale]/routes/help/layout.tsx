import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata() {
    const tMeta = await getTranslations('metadata');
    // Root layout applies the "%s | FindAfriq" title template.
    return { title: tMeta('helpTitle'), description: tMeta('helpDesc') };
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
    return children;
}

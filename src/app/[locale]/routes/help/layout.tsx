import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Help & FAQ | FindAfriq',
    description:
        'Frequently asked questions about FindAfriq — properties, services, accounts, safety, and support.',
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
    return children;
}

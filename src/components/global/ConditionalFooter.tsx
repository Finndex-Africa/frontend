'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const HIDE_FOOTER_PATHS = ['/routes/login', '/routes/verify-email'];

export default function ConditionalFooter() {
    const pathname = usePathname();
    const hideFooter = pathname && HIDE_FOOTER_PATHS.some((p) => pathname.startsWith(p));
    if (hideFooter) return null;
    return <Footer />;
}

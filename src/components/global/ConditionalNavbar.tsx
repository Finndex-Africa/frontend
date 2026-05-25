'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const HIDE_NAVBAR_PATHS = [
  '/routes/login',
  '/routes/verify-email',
  '/forgot-password',
  '/reset-password',
];

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const hideNavbar =
    pathname && HIDE_NAVBAR_PATHS.some((p) => pathname.startsWith(p));

  if (hideNavbar) return null;
  return <Navbar />;
}

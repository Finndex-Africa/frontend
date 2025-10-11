"use client";
import Link from "next/link";
import Button from "../ui/Button";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const links = [
        { href: "/", label: "Discover" },
        { href: "/routes/properties", label: "Homes" },
        { href: "/routes/services", label: "Services" },
    ];
    const router = useRouter();

    return (
        <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
            <div className="container-app flex items-center justify-between h-16">
                <Link href="/" className="font-extrabold text-xl flex items-center gap-2">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <Image
                            src="/images/logos/logo1.png"
                            alt="Hero"
                            fill
                            className="object-contain"
                        />
                    </div>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                    {links.map((l) => (
                        <Link key={l.href} href={l.href} className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                            {l.label}
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="px-4">Advertise</Button>
                    <Button
                        variant="primary"
                        className="px-4"
                        onClick={() => router.push('/routes/login')}
                    >
                        Join Us
                    </Button>
                </div>
            </div>
        </header>
    );
}




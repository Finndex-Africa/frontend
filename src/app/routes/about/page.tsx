'use client';

import Image from 'next/image';
import Link from 'next/link';
import TestimonialsSection from '../../../components/ui/TestimonialsSection';

export default function About() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* HERO */}
            <section className="relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0">
                    <Image
                        src="/images/services/cleaning1.jpeg"
                        alt="FindAfriq"
                        fill
                        className="object-cover opacity-50"
                        priority
                    />
                </div>
                <div className="absolute inset-0 bg-linear-to-b from-slate-900/40 via-slate-900/70 to-slate-900" />

                <div className="relative container-app px-4 py-16 sm:py-20">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                            About FindAfriq
                        </h1>
                        <p className="mt-4 text-white/85 text-base sm:text-lg leading-relaxed">
                            FindAfriq is a digital real estate and services platform that connects home seekers with landlords, agents, and verified service providers.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link
                                href="/routes/properties"
                                className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition"
                            >
                                Browse properties
                            </Link>
                            <Link
                                href="/routes/services"
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
                            >
                                Explore services
                            </Link>
                            <a
                                href="#contact"
                                className="inline-flex items-center justify-center rounded-lg bg-white/10 text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/15 transition"
                            >
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section className="container-app px-4 py-12 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left: what we do + story */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-7 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What we do</h2>
                            <div className="mt-4 space-y-4 text-gray-700 leading-relaxed">
                                <p>
                                    We provide a trusted digital marketplace where landlords and agents can list verified properties,
                                    home seekers can discover available rental homes, and service providers can connect with people who need their services.
                                </p>
                                <p>
                                    Our goal is to eliminate stress, fraud, and inefficiencies in the rental housing and services market by using technology
                                    to create transparency, accessibility, and trust.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 h-full">
                                <div className="text-sm font-semibold text-blue-700">Our story</div>
                                <p className="mt-2 text-gray-700 leading-relaxed text-sm sm:text-[15px]">
                                    FindAfriq is a digital real estate and services
                                    platform that connects home seekers with
                                    landlords, agents and services providers.
                                    We provide a trusted digital marketplace
                                    where landlords and agents can list verified
                                    properties, home seekers can easily discover
                                    available rental properties, and housing
                                    service providers can connect with people
                                    who need their services.
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 h-full">
                                <div className="text-sm font-semibold text-blue-700">What you get</div>
                                <ul className="mt-3 space-y-2 text-sm sm:text-[15px] text-gray-700">
                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                        Verified property listings you can trust
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                        Trusted service providers for your home
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                        Faster discovery with clear details
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                        A safer experience built for reliability
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right: mission + vision */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
                            <p className="mt-2 text-gray-700 leading-relaxed text-sm sm:text-[15px]">
                                To connect home seekers with landlords, agents, and service providers in one seamless platform.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
                            <p className="mt-2 text-gray-700 leading-relaxed text-sm sm:text-[15px]">
                                To become Africa’s leading real estate platform by redefining how people find rental homes and trusted service providers across Africa.
                            </p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl ring-1 ring-blue-100 p-6">
                            <div className="text-sm font-semibold text-blue-800">In one place</div>
                            <ul className="mt-3 space-y-2 text-sm text-blue-900/90">
                                <li className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                    Verified property listings
                                </li>
                                <li className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                    Trusted service providers
                                </li>
                                <li className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                    Simple, secure discovery
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOLUTIONS */}
            <section className="container-app px-4 pb-12 sm:pb-16">
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-7 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our solutions</h2>
                    <p className="mt-3 text-gray-700 leading-relaxed max-w-3xl">
                        FindAfriq provides a simple and trusted digital platform that connects all participants in the rental housing and services ecosystem.
                    </p>

                    <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Properties */}
                        <div className="lg:col-span-5 rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="font-semibold text-gray-900">Properties</div>
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full ring-1 ring-blue-100">
                                    Verified listings
                                </span>
                            </div>
                            <p className="mt-2 text-gray-700 leading-relaxed text-sm">
                                Discover and list verified spaces for living and business.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {['Apartments', 'Office spaces'].map((t) => (
                                    <span key={t} className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-700 ring-1 ring-gray-200">
                                        <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Services */}
                        <div className="lg:col-span-7 rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="font-semibold text-gray-900">Services</div>
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full ring-1 ring-blue-100">
                                    Trusted providers
                                </span>
                            </div>
                            <p className="mt-2 text-gray-700 leading-relaxed text-sm">
                                Connect with service providers to make managing a home or property easier.
                            </p>
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm text-gray-700">
                                {[
                                    'Electrical',
                                    'Plumbing',
                                    'Cleaning',
                                    'Painting',
                                    'Carpentry',
                                    'Moving',
                                    'Security',
                                    'Maintenance',
                                ].map((s) => (
                                    <div key={s} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                                        <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
                                        <span className="truncate">{s}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHO WE SERVE */}
            <section className="container-app px-4 pb-12 sm:pb-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Who we serve</h2>
                <p className="mt-3 text-gray-700 leading-relaxed max-w-3xl">
                    We build with every participant in mind from first-time renters to property owners and service professionals.
                </p>
                <div className="mt-7 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Home Seekers',
                            text: 'Browse and discover reliable and verified rental homes in your city.',
                        },
                        {
                            title: 'Landlords & Agents',
                            text: 'List units, reach more tenants, and reduce vacancy periods with verified listings.',
                        },
                        {
                            title: 'Service Providers',
                            text: 'Connect with people moving into new homes and looking for trusted support.',
                        },
                    ].map((item) => (
                        <div key={item.title} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-7">
                            <div className="font-semibold text-gray-900">{item.title}</div>
                            <div className="mt-2 text-gray-700 leading-relaxed">{item.text}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* TEAM */}
            <section className="container-app px-4 pb-12 sm:pb-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Meet the Team</h2>
                <p className="mt-3 text-gray-700 text-center max-w-2xl mx-auto">
                    The people behind FindAfriq working to transform the rental housing experience across the continent.
                </p>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            name: 'Levi Singbeh',
                            position: 'Co-founder / CEO',
                            country: 'Liberia',
                            linkedin: 'https://www.linkedin.com/in/levi-singbeh',
                            photo: '/images/team/levi.jpeg',
                        },
                        {
                            name: 'Mohammed Kerkulah',
                            position: 'Co-founder & Board Chair',
                            country: 'Liberia',
                            linkedin: 'https://www.linkedin.com/in/mo-kerkulah-b4108617b',
                            photo: '/images/team/mo.jpeg',
                        },
                        {
                            name: 'Christiana Miracle Bamba',
                            position: 'Marketing & Communication Officer',
                            country: 'Liberia',
                            linkedin: 'https://www.linkedin.com/in/christiana-miracle-bimba-62192b206',
                            photo: '/images/team/Christiana.jpeg',
                        },
                    ].map((member) => (
                        <div key={member.name} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
                            <div className="relative h-44">
                                <Image src={member.photo} alt={member.name} fill className="object-cover" />
                            </div>
                            <div className="p-6">
                                <div className="font-semibold text-gray-900">{member.name}</div>
                                <div className="text-sm text-blue-700 mt-1">{member.position}</div>
                                <div className="text-sm text-gray-600 mt-1">{member.country}</div>
                                <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex mt-4 text-sm font-semibold text-blue-700 hover:text-blue-800"
                                >
                                    View LinkedIn →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* TESTIMONIALS */}
            <TestimonialsSection />

            {/* CONTACT */}
            <section id="contact" className="container-app px-4 py-12 sm:py-16">
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-7 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Connect with us</h2>
                    <p className="mt-3 text-gray-700 leading-relaxed max-w-2xl">
                        Questions, partnerships, listings, or onboarding support we’re here to help.
                    </p>
                    <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="rounded-xl border border-gray-200 p-5">
                            <div className="text-xs font-semibold text-gray-500 uppercase">Office Tel</div>
                            <div className="mt-2 font-semibold text-gray-900">+231 - 779 922 382</div>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-5">
                            <div className="text-xs font-semibold text-gray-500 uppercase">WhatsApp</div>
                            <div className="mt-2 font-semibold text-gray-900">+231 - 886 149 219</div>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-5">
                            <div className="text-xs font-semibold text-gray-500 uppercase">Platform</div>
                            <div className="mt-2 font-semibold text-gray-900">www.findafriq.com</div>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-5">
                            <div className="text-xs font-semibold text-gray-500 uppercase">Email</div>
                            <div className="mt-2 font-semibold text-gray-900">findafriq@gmail.com</div>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/routes/login"
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/routes/properties"
                            className="inline-flex items-center justify-center rounded-lg bg-gray-100 text-gray-900 px-6 py-3 text-sm font-semibold hover:bg-gray-200 transition"
                        >
                            Browse properties
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

'use client';

import { useTranslations } from "next-intl";
import Image from 'next/image';
import TestimonialsSection from '@/components/ui/TestimonialsSection';

import { Link } from '@/i18n/navigation';
export default function About() {
    const t = useTranslations("aboutPage");
    const audiences = t.raw("audiences") as { title: string; text: string }[];
    const propertyTags = t.raw("propertyTags") as string[];
    const serviceTags = t.raw("serviceTags") as string[];
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
                            {t("heroTitle")}
                        </h1>
                        <p className="mt-4 text-white/85 text-base sm:text-lg leading-relaxed">
                            {t("heroBody")}
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link
                                href="/routes/properties"
                                className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition"
                            >
                                {t("browseProperties")}
                            </Link>
                            <Link
                                href="/routes/services"
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
                            >
                                {t("exploreServices")}
                            </Link>
                            <a
                                href="#contact"
                                className="inline-flex items-center justify-center rounded-lg bg-white/10 text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/15 transition"
                            >
                                {t("contact")}
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
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("whatWeDo")}</h2>
                            <div className="mt-4 space-y-4 text-gray-700 leading-relaxed">
                                <p>
                                    We provide a trusted digital marketplace where landlords and agents can list verified properties,
                                    seekers can discover available rental homes, and service providers can connect with people who need their services.
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
                                    {t("whatWeDoP1")}
                                    {t("whatWeDoP2")}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 h-full">
                                <div className="text-sm font-semibold text-blue-700">What you get</div>
                                <ul className="mt-3 space-y-2 text-sm sm:text-[15px] text-gray-700">
                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                        {t("bullet1")}
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                        {t("bullet2")}
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                        {t("bullet3")}
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                        {t("bullet4")}
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
                                To connect seekers with verified properties and trusted service providers in one seamless platform.
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
                                    {t("card1")}
                                </li>
                                <li className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                    {t("card2")}
                                </li>
                                <li className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                                    {t("card3")}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOLUTIONS */}
            <section className="container-app px-4 pb-12 sm:pb-16">
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-7 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("ourSolutions")}</h2>
                    <p className="mt-3 text-gray-700 leading-relaxed max-w-3xl">
                        {t("solutionsIntro")}
                    </p>

                    <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Properties */}
                        <div className="lg:col-span-5 rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="font-semibold text-gray-900">Properties</div>
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full ring-1 ring-blue-100">
                                    {t("verifiedListings")}
                                </span>
                            </div>
                            <p className="mt-2 text-gray-700 leading-relaxed text-sm">
                                {t("verifiedListingsBody")}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {propertyTags.map((tag) => (
                                    <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-700 ring-1 ring-gray-200">
                                        <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Services */}
                        <div className="lg:col-span-7 rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="font-semibold text-gray-900">Services</div>
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full ring-1 ring-blue-100">
                                    {t("trustedProviders")}
                                </span>
                            </div>
                            <p className="mt-2 text-gray-700 leading-relaxed text-sm">
                                {t("trustedProvidersBody")}
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
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("whoWeServe")}</h2>
                <p className="mt-3 text-gray-700 leading-relaxed max-w-3xl">
                    {t("whoWeServeIntro")}
                </p>
                <div className="mt-7 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {audiences.map((item) => (
                        <div key={item.title} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-7">
                            <div className="font-semibold text-gray-900">{item.title}</div>
                            <div className="mt-2 text-gray-700 leading-relaxed">{item.text}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* PARTNERS */}
            <section className="container-app px-4 pb-12 sm:pb-16">
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 px-7 py-10 sm:px-12 sm:py-14">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-4">
                        {t("partnersLine1")}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center leading-snug">
                        {t("partnersLine2")}
                    </h2>
                    <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-6 sm:gap-10 items-center justify-items-center">
                        {[
                            { name: 'Orange Digital Center', logo: '/images/partners/Orange.png' },
                            { name: 'Orange Foundation', logo: '/images/partners/Orange Foundation.png' },
                            { name: 'Tony Elumelu Foundation', logo: '/images/partners/Tony Elumelu.png' },
                        ].map((partner) => (
                            <div key={partner.name} className="flex items-center justify-center w-full px-2 sm:px-4 py-2">
                                <div className="relative h-36 sm:h-44 w-full max-w-[300px]">
                                    <Image
                                        src={partner.logo}
                                        alt={partner.name}
                                        fill
                                        sizes="300px"
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <TestimonialsSection />

            {/* CONTACT */}
            <section id="contact" className="container-app px-4 py-12 sm:py-16">
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-7 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("connectWithUs")}</h2>
                    <p className="mt-3 text-gray-700 leading-relaxed max-w-2xl">
                        {t("connectBody")}
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
                            <div className="mt-2 font-semibold text-gray-900">info@findafriq.com</div>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/routes/login"
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition"
                        >
                            {t("getStarted")}
                        </Link>
                        <Link
                            href="/routes/properties"
                            className="inline-flex items-center justify-center rounded-lg bg-gray-100 text-gray-900 px-6 py-3 text-sm font-semibold hover:bg-gray-200 transition"
                        >
                            {t("browseProperties")}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

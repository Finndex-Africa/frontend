'use client';

import Image from 'next/image';
import TestimonialsSection from '../../../components/ui/TestimonialsSection';

export default function About() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* HERO SECTION */}
            <section className="relative h-[320px] w-full overflow-hidden">
                <Image src="/images/services/cleaning1.jpeg" alt="Trusted services" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white">
                    <div className="relative w-64 h-24 mb-4 md:w-96 md:h-32 overflow-hidden rounded-2xl drop-shadow-lg">
                        <Image
                            src="/images/logos/logo-horizontal-yellow-bg.png"
                            alt="Finndex Africa"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="px-4 text-3xl md:text-5xl font-extrabold">About Us</h1>
                </div>
            </section>

            {/* Cultural pattern */}
            <div
                className="h-12 w-full bg-repeat-x bg-center bg-white opacity-95"
                style={{ backgroundImage: 'url(/images/patterns/pattern-triangle-spiral.png)', backgroundSize: 'auto 3rem' }}
                aria-hidden
            />

            {/* OUR MISSION & VISION */}
            <section className="container mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                    <p className="text-gray-700 text-lg">
                        To provide access to affordable and verified housing by leveraging technology
                        that ensures transparency, affordability, and efficiency in the rental process.
                    </p>
                </div>
                <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                    <p className="text-gray-700 text-lg">
                        To become Africa’s leading real estate platform by 2035 and redefine how people
                        find homes, making it faster, easier, and more reliable.
                    </p>
                </div>
            </section>

            {/* COMPANY STORY */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <Image
                            src="/images/properties/pexels-photo-323780.jpeg"
                            alt="Our Story"
                            width={600}
                            height={400}
                            className="rounded-xl shadow-lg object-cover"
                        />
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                        <p className="text-gray-700 mb-4">
                            Finndex Africa Inc. is a PropTech startup dedicated to transforming the rental housing experience across Africa.
                            We leverage technology to create a transparent, efficient, and trusted marketplace that connects home seekers, landlords,
                            and service providers in one unified digital ecosystem.
                        </p>
                        <p className="text-gray-700 mb-4">
                            Our platform was established to address long-standing challenges within the rental housing sector, including unverified listings,
                            excessive agent fees, rental scams, and inefficient search processes. Through digital innovation, Finndex Africa simplifies every step
                            of the rental journey making it faster, safer, and more affordable for individuals and families to find suitable housing and services.
                        </p>
                        <p className="text-gray-700">
                            Beyond property listings, we provide access to verified household service providers, enabling users to connect with reliable electricians,
                            plumbers, movers, and cleaners. Finndex Africa operates as a community-driven, trusted digital marketplace designed to enhance convenience,
                            promote accountability, and support inclusive growth within Africa’s housing ecosystem.
                        </p>
                    </div>
                </div>
            </section>


            {/* MEET THE TEAM */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Meet the Team</h2>
                    <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
                        The people behind Finndex Africa working to transform the rental housing experience across the continent.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                            <div
                                key={member.name}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden text-center"
                            >
                                <div className="bg-gradient-to-br from-blue-600 to-blue-800 pt-10 pb-14 relative">
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                        <div className="w-24 h-24 rounded-full bg-white shadow-lg overflow-hidden border-4 border-white ring-2 ring-blue-200">
                                            <Image
                                                src={member.photo}
                                                alt={member.name}
                                                width={96}
                                                height={96}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-16 pb-8 px-6">
                                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                                    <p className="text-blue-600 font-medium mt-1">{member.position}</p>
                                    <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {member.country}
                                    </p>
                                    <a
                                        href={member.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-semibold rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        LinkedIn
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* USER TESTIMONIALS */}
            <TestimonialsSection />


            {/* CTA */}
            <section className="bg-blue-600 py-16 text-white text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Us on Our Journey</h2>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6">
                    Whether you&apos;re looking for services or want to provide your expertise, we welcome you to be part of our growing community.
                </p>
                <a
                    href="/routes/login"
                    className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    Get Started
                </a>
            </section>
        </div>
    );
}

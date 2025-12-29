'use client';

import Image from 'next/image';
import TestimonialsSection from '../../../components/ui/TestimonialsSection';

export default function About() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* HERO SECTION */}
            <section className="relative h-[320px] w-full overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1497366216548-37526070297c" alt="Trusted services" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white">
                    <h1 className="px-4 text-3xl md:text-5xl font-extrabold">About Us</h1>
                </div>
            </section>

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
                            src="https://images.unsplash.com/photo-1521791136064-7986c2920216"
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
                            of the rental journey—making it faster, safer, and more affordable for individuals and families to find suitable housing and services.
                        </p>
                        <p className="text-gray-700">
                            Beyond property listings, we provide access to verified household service providers, enabling users to connect with reliable electricians,
                            plumbers, movers, and cleaners. Finndex Africa operates as a community-driven, trusted digital marketplace designed to enhance convenience,
                            promote accountability, and support inclusive growth within Africa’s housing ecosystem.
                        </p>
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

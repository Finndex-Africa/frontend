"use client";
import Image from "next/image";
import ServiceProviderCard, { ServiceProvider } from "@/components/domain/ServiceProviderCard";
import SearchFilters from "@/components/domain/SearchFilters";

const providers: ServiceProvider[] = [
    { id: "1", name: "Mel's Plumbing", services: ["Plumbing", "Repairs"], location: "Accra", contact: "mels@example.com", verified: true, imageUrl: "/images/services/plumbing1.jpeg" },
    { id: "2", name: "Sparklynix", services: ["Cleaning"], location: "Lagos", contact: "clean@example.com", verified: false, imageUrl: "/images/services/cleaning1.jpeg" },
];

export default function ServicesPage() {
    return (
        <div className="">
            <section className="relative h-[320px] w-full overflow-hidden">
                <Image src="/images/services/cleaning1.jpeg" alt="Trusted services" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white">
                    <h1 className="px-4 text-3xl md:text-5xl font-extrabold">Find Trusted Services</h1>
                    <div className="container-app mt-5 max-w-6xl">
                        <SearchFilters value={{}} onChange={() => { }} onSubmit={() => { }} />
                    </div>
                </div>
            </section>

            <section className="container-app py-10">
                <div className="flex items-end justify-between">
                    <h2 className="text-2xl md:text-3xl font-extrabold">Service Provider <span className="text-blue-700">Listings</span></h2>
                    <button className="btn btn-secondary">Filter</button>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {providers.concat(providers, providers).map((sp, i) => (
                        <ServiceProviderCard key={sp.id + "-" + i} sp={sp} />
                    ))}
                </div>
            </section>
        </div>
    );
}




"use client";
import Image from "next/image";
import { useState } from "react";
import ServiceCard, { Service } from "../../../components/domain/ServiceCard";

export default function ServicesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const sampleServices: Service[] = [
        { id: "1", name: "Mel's Plumbing Services", location: "Old Road, Monrovia", rating: 4.5, reviews: 1240, imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39", tags: ["Drain Cleaning", "Water Heater", "Repair"], badge: "PROFESSIONAL" },
        { id: "2", name: "Sparklynix", location: "8th Street, Sinkor", rating: 4.8, reviews: 856, imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952", tags: ["Residential", "Office Cleaning", "Dry Cleaning"], badge: "PROFESSIONAL" },
        { id: "3", name: "Voltura", location: "GAD Junction, Congo Town", rating: 4.6, reviews: 2130, imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a", tags: ["Wiring", "Power Installation", "Lighting"], badge: "PROFESSIONAL" },
        { id: "4", name: "ShiftEase", location: "Rehab, Paynesville City", rating: 4.7, reviews: 645, imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf", tags: ["Packing", "Furniture Assembly", "Relocation"], badge: "PROFESSIONAL" },
        { id: "5", name: "PipeSure", location: "5D, Cooper Road, Paynesville City", rating: 4.9, reviews: 1567, imageUrl: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4", tags: ["Water Heater Installation", "Pipe Repairs", "Bathroom"], badge: "PROFESSIONAL" },
        { id: "6", name: "ElectroFix", location: "Broad Street, Monrovia", rating: 4.8, reviews: 980, imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952", tags: ["Electrical Repair", "Wiring", "Lighting"], badge: "PROFESSIONAL" },
        { id: "7", name: "CleanSweep", location: "Bushrod, Monrovia", rating: 4.6, reviews: 740, imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a", tags: ["Janitorial", "Deep Cleaning", "Sanitation"], badge: "PROFESSIONAL" },
        { id: "8", name: "FixItAll", location: "Mamba Point, Monrovia", rating: 4.7, reviews: 860, imageUrl: "https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5", tags: ["General Maintenance", "Plumbing", "Electrical"], badge: "PROFESSIONAL" },
        { id: "9", name: "TechSavvy IT", location: "Sinkor, Monrovia", rating: 4.9, reviews: 1120, imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952", tags: ["Computer Setup", "Networking", "Repair"], badge: "PROFESSIONAL" },
        {
            id: "10",
            name: "HandyPro",
            location: "Paynesville City",
            rating: 4.8,
            reviews: 980,
            imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a",
            tags: ["Furniture Assembly", "Small Repairs", "Installations"],
            badge: "PROFESSIONAL"
        }
    ];

    const totalPages = Math.ceil(sampleServices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentServices = sampleServices.slice(startIndex, startIndex + itemsPerPage);

    const goNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
    const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));

    return (
        <div className="min-h-screen bg-white">
            {/* HERO */}
            <section className="relative h-[400px] w-full overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
                    alt="Hero"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold max-w-4xl leading-tight mb-8">
                        Discover Trusted Services
                    </h1>
                </div>
            </section>

            {/* SERVICES GRID */}
            <div className="container-app py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                    {currentServices.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>

                {/* PAGINATION */}
                <div className="flex justify-center items-center mt-8 space-x-3">
                    <button
                        onClick={goPrev}
                        disabled={currentPage === 1}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
                    >
                        ‹
                    </button>

                    {/* Display small page dots for total pages */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 flex items-center justify-center rounded-full transition
        ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={goNext}
                        disabled={currentPage === totalPages}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
}

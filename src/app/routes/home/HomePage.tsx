"use client";
import PropertyCard, { Property } from "../../../components/domain/PropertyCard";
import ServiceCard, { Service } from "../../../components/domain/ServiceCard";
import SearchBar from "../../../components/ui/SearchBar";
import StatsSection from "../../../components/ui/StatsSection";
import PartnerLogos from "../../../components/ui/PartnerLogos";
import Image from "next/image";
import { useRouter } from 'next/navigation';

const sampleProperties: Property[] = [
    {
        id: "1",
        title: "Lake View Apartment",
        location: "Rubavu, Western Province, Rwanda",
        price: "$450",
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
        amenities: ["2 guests", "1 bedroom", "1 bed"],
        rating: 4.95,
        distance: "152 kilometers away",
        dates: "Nov 1 - 30"
    },
    {
        id: "2",
        title: "Mountain Cabin Retreat",
        location: "Musanze, Northern Province, Rwanda",
        price: "$320",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        amenities: ["4 guests", "2 bedrooms", "3 beds"],
        rating: 4.89,
        distance: "120 kilometers away",
        dates: "Nov 15 - Dec 14"
    },
    {
        id: "3",
        title: "Serenity Villa",
        location: "Nyamata, Bugesera District, Rwanda",
        price: "$580",
        imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
        amenities: ["6 guests", "3 bedrooms", "4 beds"],
        rating: 4.98,
        distance: "35 kilometers away",
        dates: "Dec 1 - 31"
    },
    {
        id: "4",
        title: "Lakeside Cottage",
        location: "Karongi, Western Province, Rwanda",
        price: "$390",
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        amenities: ["4 guests", "2 bedrooms", "2 beds"],
        rating: 4.92,
        distance: "180 kilometers away",
        dates: "Nov 8 - Dec 7"
    },
    {
        id: "5",
        title: "Downtown Loft",
        location: "Kigali City, Rwanda",
        price: "$275",
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        amenities: ["2 guests", "Studio", "1 bed"],
        rating: 4.87,
        distance: "5 kilometers away",
        dates: "Nov 22 - Dec 21"
    },
    {
        id: "6",
        title: "Treehouse Getaway",
        location: "Rutsiro, Western Province, Rwanda",
        price: "$210",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        amenities: ["2 guests", "1 bedroom", "1 bed"],
        rating: 4.99,
        distance: "160 kilometers away",
        dates: "Dec 10 - Jan 9"
    },
    {
        id: "7",
        title: "Hillside Apartment",
        location: "Huye, Southern Province, Rwanda",
        price: "$340",
        imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
        amenities: ["3 guests", "1 bedroom", "2 beds"],
        rating: 4.84,
        distance: "130 kilometers away",
        dates: "Nov 18 - Dec 17"
    },
    {
        id: "8",
        title: "Country Estate Home",
        location: "Nyanza, Southern Province, Rwanda",
        price: "$495",
        imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
        amenities: ["8 guests", "4 bedrooms", "5 beds"],
        rating: 4.96,
        distance: "115 kilometers away",
        dates: "Dec 3 - Jan 2"
    },
    {
        id: "9",
        title: "Heritage Townhouse",
        location: "Rwamagana, Eastern Province, Rwanda",
        price: "$425",
        imageUrl: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09",
        amenities: ["5 guests", "3 bedrooms", "3 beds"],
        rating: 4.91,
        distance: "65 kilometers away",
        dates: "Nov 25 - Dec 24"
    },
    {
        id: "10",
        title: "Modern Penthouse",
        location: "Kigali City, Rwanda",
        price: "$620",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
        amenities: ["4 guests", "2 bedrooms", "2 beds"],
        rating: 4.93,
        distance: "4 kilometers away",
        dates: "Dec 5 - Jan 4"
    },
    {
        id: "11",
        title: "Vineyard Escape",
        location: "Gicumbi, Northern Province, Rwanda",
        price: "$750",
        imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
        amenities: ["10 guests", "5 bedrooms", "6 beds"],
        rating: 4.97,
        distance: "80 kilometers away",
        dates: "Nov 12 - Dec 11"
    },
    {
        id: "12",
        title: "Island Bungalow",
        location: "Kibuye, Western Province, Rwanda",
        price: "$380",
        imageUrl: "https://images.unsplash.com/photo-1501183638710-841dd1904471",
        amenities: ["3 guests", "1 bedroom", "2 beds"],
        rating: 4.88,
        distance: "175 kilometers away",
        dates: "Dec 12 - Jan 11"
    },
];

const sampleServices: Service[] = [
    {
        id: "1",
        name: "Mel's Plumbing Services",
        location: "Old Road, Monrovia",
        rating: 4.5,
        reviews: 1240,
        imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39",
        tags: ["Drain Cleaning", "Water Heater", "Repair"],
        badge: "PROFESSIONAL"
    },
    {
        id: "2",
        name: "Sparklynix",
        location: "8th Street, Sinkor",
        rating: 4.8,
        reviews: 856,
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
        tags: ["Residential", "Office Cleaning", "Dry Cleaning"],
        badge: "PROFESSIONAL"
    },
    {
        id: "3",
        name: "Voltura",
        location: "GAD Junction, Congo Town",
        rating: 4.6,
        reviews: 2130,
        imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a",
        tags: ["Wiring and Rewiring", "Power Installation", "Lighting"],
        badge: "PROFESSIONAL"
    },
    {
        id: "4",
        name: "ShiftEase",
        location: "Rehab, Paynesville City",
        rating: 4.7,
        reviews: 645,
        imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf",
        tags: ["Packing and Unpacking", "Furniture Assembly", "Relocation"],
        badge: "PROFESSIONAL"
    },
    {
        id: "5",
        name: "PipeSure",
        location: "5D, Cooper Road, Paynesville City",
        rating: 4.9,
        reviews: 1567,
        imageUrl: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4",
        tags: ["Water Heater Installation", "Pipe Repairs", "Bathroom"],
        badge: "PROFESSIONAL"
    },
];

const partnerLogos = [
    { name: "Orange Foundation", logoUrl: "/images/partners/55e811dd-e77f-415c-bd80-073b2fa9b71c.png" },
    { name: "MoMo Real Estate", logoUrl: "/images/partners/55ff3a0b-04aa-4fd0-93cf-4f36216d6b92.png" },
    { name: "Orange Digital Center", logoUrl: "/images/partners/aeb9e930-3e9d-4c77-9f7e-052508497447.png" },
    { name: "Partner 4", logoUrl: "/images/partners/e42bd8f1-69be-442e-9220-24d00ec46d8b.png" },
];


export default function HomePage() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section with Search Overlay */}
            <section className="relative h-[500px] w-full overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
                    alt="Hero"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold max-w-4xl leading-tight mb-8">
                        Discover the Perfect Home & Services
                    </h1>
                    <div className="w-full max-w-4xl">
                        <SearchBar />
                    </div>
                </div>
            </section>

            {/* Trusted Partners Section */}
            <section className="container-app py-12 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-center mb-8">
                    Trusted <span className="text-blue-600">Partners</span>
                </h2>
                <PartnerLogos partners={partnerLogos} />
            </section>

            {/* Property Grid */}
            <div className="container-app py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                    Explore available homes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                    {sampleProperties.map((property) => (
                        <PropertyCard key={property.id} p={property} />
                    ))}
                </div>
            </div>

            {/* Continue exploring section */}
            <div className="border-t border-gray-200">
                <div className="container-app py-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                        Continue exploring homes
                    </h2>
                    <button className="border cursor-pointer border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        onClick={() => router.push('/routes/properties')}
                    >
                        Show more
                    </button>
                </div>
            </div>

            {/* Full-Width Stats Divider */}
            <StatsSection
                imageUrl="/images/SectionSeparator.jpeg"
                title="We are Here For You."
                stats={[
                    { value: "20,000+", label: "Homes Available" },
                    { value: "10,000+", label: "Services Available" }
                ]}
            />

            {/* Services Section */}
            <div className="container-app py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                    Explore trusted service providers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                    {sampleServices.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>

            {/* Continue exploring services */}
            <div className="border-t border-gray-200">
                <div className="container-app py-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                        More services to explore
                    </h2>
                    <button className="border cursor-pointer border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        onClick={() => router.push('/routes/services')}
                    >
                        Show more services
                    </button>
                </div>
            </div>
        </div>
    );
}

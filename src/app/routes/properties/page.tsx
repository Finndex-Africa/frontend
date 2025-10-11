"use client"
import Image from "next/image"
import PropertyCard, { Property } from "../../../components/domain/PropertyCard";
import { useState } from "react";

export default function PropertiesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
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

        // New properties to reach 30
        {
            id: "13",
            title: "Cozy Riverside Cabin",
            location: "Gisenyi, Western Province, Rwanda",
            price: "$310",
            imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
            amenities: ["3 guests", "1 bedroom", "2 beds"],
            rating: 4.90,
            distance: "150 kilometers away",
            dates: "Nov 20 - Dec 19"
        },
        {
            id: "14",
            title: "Luxury Safari Lodge",
            location: "Akagera, Eastern Province, Rwanda",
            price: "$980",
            imageUrl: "https://images.unsplash.com/photo-1576675786429-162fe1e64b44",
            amenities: ["12 guests", "6 bedrooms", "8 beds"],
            rating: 4.99,
            distance: "210 kilometers away",
            dates: "Dec 1 - Jan 1"
        },
        {
            id: "15",
            title: "Modern City Apartment",
            location: "Kigali City, Rwanda",
            price: "$410",
            imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
            amenities: ["2 guests", "1 bedroom", "1 bed"],
            rating: 4.85,
            distance: "3 kilometers away",
            dates: "Nov 28 - Dec 27"
        },
        {
            id: "16",
            title: "Forest Retreat Cabin",
            location: "Nyungwe, Southern Province, Rwanda",
            price: "$550",
            imageUrl: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6",
            amenities: ["5 guests", "2 bedrooms", "3 beds"],
            rating: 4.94,
            distance: "200 kilometers away",
            dates: "Dec 10 - Jan 9"
        },
        {
            id: "17",
            title: "Beachfront Villa",
            location: "Lake Kivu, Western Province, Rwanda",
            price: "$880",
            imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
            amenities: ["8 guests", "4 bedrooms", "5 beds"],
            rating: 4.97,
            distance: "160 kilometers away",
            dates: "Nov 30 - Dec 29"
        },
        {
            id: "18",
            title: "Charming Countryside House",
            location: "Muhanga, Southern Province, Rwanda",
            price: "$290",
            imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
            amenities: ["4 guests", "2 bedrooms", "2 beds"],
            rating: 4.82,
            distance: "90 kilometers away",
            dates: "Dec 5 - Jan 4"
        },
        {
            id: "19",
            title: "Hilltop Luxury Villa",
            location: "Kigali City, Rwanda",
            price: "$750",
            imageUrl: "https://images.unsplash.com/photo-1549187774-b4a2b9a4f7e7",
            amenities: ["6 guests", "3 bedrooms", "4 beds"],
            rating: 4.96,
            distance: "6 kilometers away",
            dates: "Dec 15 - Jan 14"
        },
        {
            id: "20",
            title: "Secluded Garden Cottage",
            location: "Ruhango, Southern Province, Rwanda",
            price: "$320",
            imageUrl: "https://images.unsplash.com/photo-1521790797524-b2497295b8b2",
            amenities: ["3 guests", "1 bedroom", "2 beds"],
            rating: 4.88,
            distance: "100 kilometers away",
            dates: "Nov 26 - Dec 25"
        },
        {
            id: "21",
            title: "Panoramic Lakeview Penthouse",
            location: "Rubavu, Western Province, Rwanda",
            price: "$620",
            imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
            amenities: ["4 guests", "2 bedrooms", "2 beds"],
            rating: 4.95,
            distance: "155 kilometers away",
            dates: "Dec 1 - Dec 31"
        },
        {
            id: "22",
            title: "Rustic Mountain Lodge",
            location: "Musanze, Northern Province, Rwanda",
            price: "$470",
            imageUrl: "https://images.unsplash.com/photo-1549187774-b4a2b9a4f7e7",
            amenities: ["6 guests", "3 bedrooms", "4 beds"],
            rating: 4.92,
            distance: "125 kilometers away",
            dates: "Nov 20 - Dec 19"
        },
        {
            id: "23",
            title: "Boutique City Loft",
            location: "Kigali City, Rwanda",
            price: "$350",
            imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
            amenities: ["2 guests", "1 bedroom", "1 bed"],
            rating: 4.86,
            distance: "4 kilometers away",
            dates: "Dec 3 - Jan 2"
        },
        {
            id: "24",
            title: "Countryside Farmhouse",
            location: "Nyamata, Bugesera District, Rwanda",
            price: "$430",
            imageUrl: "https://images.unsplash.com/photo-1521790797524-b2497295b8b2",
            amenities: ["6 guests", "3 bedrooms", "4 beds"],
            rating: 4.91,
            distance: "40 kilometers away",
            dates: "Nov 25 - Dec 24"
        },
        {
            id: "25",
            title: "Luxury Treehouse",
            location: "Rutsiro, Western Province, Rwanda",
            price: "$250",
            imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            amenities: ["2 guests", "1 bedroom", "1 bed"],
            rating: 4.99,
            distance: "165 kilometers away",
            dates: "Dec 12 - Jan 11"
        },
        {
            id: "26",
            title: "Mountain View Apartment",
            location: "Huye, Southern Province, Rwanda",
            price: "$360",
            imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
            amenities: ["3 guests", "1 bedroom", "2 beds"],
            rating: 4.84,
            distance: "135 kilometers away",
            dates: "Nov 30 - Dec 29"
        },
        {
            id: "27",
            title: "Elegant Lakeside Villa",
            location: "Karongi, Western Province, Rwanda",
            price: "$520",
            imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
            amenities: ["6 guests", "3 bedrooms", "4 beds"],
            rating: 4.97,
            distance: "185 kilometers away",
            dates: "Dec 5 - Jan 4"
        },
        {
            id: "28",
            title: "Historic Townhouse",
            location: "Rwamagana, Eastern Province, Rwanda",
            price: "$420",
            imageUrl: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09",
            amenities: ["5 guests", "3 bedrooms", "3 beds"],
            rating: 4.90,
            distance: "70 kilometers away",
            dates: "Dec 1 - Dec 31"
        },
        {
            id: "29",
            title: "Luxury Island Villa",
            location: "Kibuye, Western Province, Rwanda",
            price: "$880",
            imageUrl: "https://images.unsplash.com/photo-1501183638710-841dd1904471",
            amenities: ["8 guests", "4 bedrooms", "5 beds"],
            rating: 4.98,
            distance: "180 kilometers away",
            dates: "Dec 10 - Jan 9"
        },
        {
            id: "30",
            title: "Grand Countryside Mansion",
            location: "Nyanza, Southern Province, Rwanda",
            price: "$950",
            imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
            amenities: ["12 guests", "6 bedrooms", "7 beds"],
            rating: 4.99,
            distance: "120 kilometers away",
            dates: "Dec 15 - Jan 14"
        }
    ];

    const totalPages = Math.ceil(sampleProperties.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProperties = sampleProperties.slice(startIndex, startIndex + itemsPerPage);

    const goNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
    const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));

    return (
        <div className="min-h-screen bg-white">
            {/* HERO SECTION */}
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
                        Discover the Perfect Home
                    </h1>
                </div>
            </section>

            {/* PROPERTIES GRID */}
            <div className="container-app py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                    {currentProperties.map((property) => (
                        <PropertyCard key={property.id} p={property} />
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
    )
} 
"use client";
import Image from "next/image";
import Button from "@/components/ui/Button";
import MediaCarousel from "@/components/domain/MediaCarousel";
import { useState } from "react";

export type Review = {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    text: string;
    date?: string;
};

export type Service = {
    id?: string;
    title?: string;
    category?: string;
    location?: string;
    rating?: number;
    reviewsCount?: number;
    description?: string;
    images?: string[];
    tags?: string[];
    badge?: string;
    provider?: {
        name?: string;
        avatar?: string;
        verified?: boolean;
        stats?: string;
    };
    reviews?: Review[];
    mapUrl?: string;
    price?: number;
    duration?: string;
    included?: string[];
    availability?: string;
};

export default function ServiceDetail({ service }: { service?: Service }) {
    const [showAllReviews, setShowAllReviews] = useState(false);

    const defaultService: Service = {
        title: "Professional Plumbing Service",
        category: "Plumbing",
        location: "Kigali, Rwanda",
        rating: 4.9,
        reviewsCount: 42,
        description:
            "Expert plumbing services including leak repairs, pipe installations, and emergency fixes. Trusted by locals for prompt and reliable service.",
        images: [
            "/images/services/plumbing1.jpeg",
            "/images/services/plumbing2.jpeg",
            "/images/services/plumbing3.jpeg",
            "/images/services/plumbing4.jpeg",
        ],
        tags: ["Trusted", "Licensed", "Fast"],
        badge: "Top Rated",
        provider: {
            name: "James Miller",
            avatar: "https://randomuser.me/api/portraits/men/46.jpg",
            verified: true,
            stats: "10 years experience · Licensed Technician",
        },
        reviews: [
            { id: "1", name: "Alice", avatar: "https://randomuser.me/api/portraits/women/5.jpg", rating: 5, text: "Fixed my leak in no time!", date: "2025-10-01" },
            { id: "2", name: "Bob", avatar: "https://randomuser.me/api/portraits/men/8.jpg", rating: 4, text: "Very professional and fast.", date: "2025-09-28" },
        ],
        price: 25,
        mapUrl: "https://www.google.com/maps?q=Kigali,+Rwanda&output=embed",
        duration: "1-2 hours",
        included: ["Tools included", "Cleanup after service", "Warranty on work"],
        availability: "Mon-Sat, 8am-6pm",
    };

    const s = service || defaultService;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HERO SECTION */}
            <section className="relative w-full max-w-7xl mx-auto">
                <MediaCarousel
                    media={(s.images || []).map((src) => ({ type: "image", src }))}
                />
            </section>

            {/* MAIN CONTENT */}
            <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 px-6 py-10">
                {/* LEFT SIDE */}
                <div className="lg:col-span-2 space-y-10">
                    {/* TITLE & BASIC INFO */}
                    <header>
                        <div className="text-sm uppercase text-blue-600 font-semibold tracking-wider">
                            {s.category}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mt-1">{s.title}</h1>
                        <p className="text-gray-600 text-lg mt-1">{s.location}</p>

                        <div className="flex items-center gap-2 mt-3">
                            <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="text-gray-900 font-semibold text-lg">{s.rating}</span>
                            <span className="text-gray-600 text-sm">({s.reviewsCount} reviews)</span>
                            {s.duration && (
                                <span className="ml-4 text-gray-600 text-sm">⏱ {s.duration}</span>
                            )}
                        </div>
                    </header>

                    {/* ABOUT SERVICE */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">About this service</h2>
                        <p className="text-gray-700 leading-relaxed">{s.description}</p>

                        {s.included && (
                            <ul className="mt-3 list-disc list-inside text-gray-700">
                                {s.included.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        )}

                        {s.availability && (
                            <p className="mt-3 text-gray-600 text-sm">
                                <strong>Availability:</strong> {s.availability}
                            </p>
                        )}
                    </section>

                    {/* SERVICE PROVIDER INFO */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Provided by</h2>
                        <div className="flex items-center gap-4 bg-white shadow-sm p-4 rounded-xl">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                <Image
                                    src={s.provider?.avatar!}
                                    alt={s.provider?.name!}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 text-lg">{s.provider?.name}</p>
                                    {s.provider?.verified && (
                                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm mt-1">{s.provider?.stats}</p>
                            </div>
                        </div>
                    </section>

                    {/* MAP SECTION */}
                    {s.mapUrl && (
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Coverage</h2>
                            <div className="w-full h-64 rounded-xl overflow-hidden shadow-sm">
                                <iframe
                                    src={s.mapUrl}
                                    width="100%"
                                    height="100%"
                                    loading="lazy"
                                    className="border-0"
                                ></iframe>
                            </div>
                        </section>
                    )}

                    {/* REVIEWS */}
                    {s.reviews && s.reviews.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>
                            <div className="space-y-4">
                                {(showAllReviews ? s.reviews : s.reviews.slice(0, 2)).map((review) => (
                                    <div key={review.id} className="bg-white p-5 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Image
                                                src={review.avatar || "/images/reviews/default-user.jpg"}
                                                alt={review.name}
                                                width={40}
                                                height={40}
                                                className="rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">{review.name}</p>
                                                {review.date && (
                                                    <p className="text-gray-400 text-xs">{review.date}</p>
                                                )}
                                                <div className="flex mt-1">
                                                    {Array.from({ length: review.rating }).map((_, j) => (
                                                        <svg
                                                            key={j}
                                                            className="w-4 h-4 text-amber-400 fill-current"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                                    </div>
                                ))}
                                {s.reviews.length > 2 && (
                                    <button
                                        onClick={() => setShowAllReviews(!showAllReviews)}
                                        className="text-blue-600 text-sm font-semibold"
                                    >
                                        {showAllReviews ? "Show less" : "Show all reviews"}
                                    </button>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* RIGHT SIDE */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-28 space-y-6">
                        {/* BOOKING CARD */}
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                            <div className="flex items-end gap-1 mb-4">
                                <div className="text-4xl font-bold text-gray-900">${s.price}</div>
                                <span className="text-gray-600 text-base">/hour</span>
                            </div>
                            <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                                Book Service
                            </Button>
                            <Button className="w-full h-12 text-base font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl mt-2">
                                Chat with Provider
                            </Button>
                            {s.duration && (
                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    Estimated time: {s.duration}
                                </p>
                            )}
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    );
}

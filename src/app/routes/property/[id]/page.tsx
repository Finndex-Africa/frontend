import MediaCarousel from "@/components/domain/MediaCarousel";
import Button from "@/components/ui/Button";
import MessageThread from "@/components/domain/MessageThread";
import Image from "next/image";

export default function PropertyDetail() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* HERO SECTION */}
            <section className="relative w-full max-w-7xl mx-auto">
                <MediaCarousel
                    media={[
                        { type: "image", src: "https://images.unsplash.com/photo-1449844908441-8829872d2607" },
                        { type: "image", src: "https://images.unsplash.com/photo-1501183638710-841dd1904471" },
                        { type: "image", src: "https://images.unsplash.com/photo-1570129477492-45c003edd2be" }
                    ]}
                />
            </section>

            {/* MAIN CONTENT */}
            <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 px-6 py-10">
                {/* LEFT SIDE */}
                <div className="lg:col-span-2 space-y-10">
                    {/* TITLE & BASIC INFO */}
                    <header>
                        <div className="text-sm uppercase text-blue-600 font-semibold tracking-wider">For Rent</div>
                        <h1 className="text-4xl font-bold text-gray-900 mt-1">Modern Apartment</h1>
                        <p className="text-gray-600 text-lg mt-1">Accra, Ghana</p>

                        <div className="flex items-center gap-2 mt-3">
                            <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="text-gray-900 font-semibold text-lg">4.8</span>
                            <span className="text-gray-600 text-sm">(230 reviews)</span>
                        </div>
                    </header>

                    {/* ABOUT */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">About this place</h2>
                        <p className="text-gray-700 leading-relaxed">
                            A stylish and comfortable apartment located in the vibrant neighborhood of East Legon.
                            With large windows, natural light, and modern furniture, it’s perfect for short- and long-term stays.
                            Steps away from restaurants, shops, and public transport.
                        </p>
                    </section>

                    {/* WHAT THIS PLACE OFFERS */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">What this place offers</h2>
                        <div className="grid sm:grid-cols-2 gap-5">
                            {[
                                { label: "Wi-Fi", desc: "Fast and reliable internet", icon: "📶" },
                                { label: "Air Conditioning", desc: "Cool and comfortable", icon: "❄️" },
                                { label: "Kitchen", desc: "Fully equipped", icon: "🍳" },
                                { label: "TV", desc: "Smart TV with Netflix", icon: "📺" },
                                { label: "Free Parking", desc: "On-site secure parking", icon: "🚗" },
                                { label: "Pet Friendly", desc: "Bring your furry friends", icon: "🐶" },
                            ].map((f, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="text-2xl">{f.icon}</div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{f.label}</div>
                                        <div className="text-sm text-gray-600">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* LANDLORD INFO */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hosted by</h2>
                        <div className="flex items-center gap-4 bg-white shadow-sm p-4 rounded-xl">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                <Image
                                    src="https://randomuser.me/api/portraits/men/44.jpg"
                                    alt="Landlord"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 text-lg">John Mensah</p>
                                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                        Verified
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mt-1">Superhost · Responds within 1 hour</p>
                            </div>
                        </div>
                    </section>

                    {/* MAP SECTION */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Where you’ll be</h2>
                        <div className="w-full h-64 rounded-xl overflow-hidden shadow-sm">
                            <iframe
                                src="https://www.google.com/maps?q=Accra,+Ghana&output=embed"
                                width="100%"
                                height="100%"
                                loading="lazy"
                                className="border-0"
                            ></iframe>
                        </div>
                    </section>

                    {/* REVIEWS SECTION */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Guest Reviews</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    name: "Sarah Williams",
                                    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
                                    text: "Amazing apartment! Super clean and comfortable. The host was very kind and communication was easy.",
                                    rating: 5,
                                },
                                {
                                    name: "James Owusu",
                                    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
                                    text: "Excellent location and very stylish interior. Would definitely come back again!",
                                    rating: 4,
                                },
                            ].map((review, i) => (
                                <div key={i} className="bg-white p-5 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Image
                                            src={review.avatar}
                                            alt={review.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">{review.name}</p>
                                            <div className="flex">
                                                {Array.from({ length: review.rating }).map((_, i) => (
                                                    <svg
                                                        key={i}
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
                        </div>
                    </section>
                </div>

                {/* RIGHT SIDE */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-28 space-y-6">
                        {/* PRICING CARD */}
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                            <div className="flex items-end gap-1 mb-4">
                                <div className="text-4xl font-bold text-gray-900">$800</div>
                                <span className="text-gray-600 text-base">/month</span>
                            </div>
                            <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                                Contact Landlord
                            </Button>
                        </div>

                        {/* MESSAGE THREAD */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <MessageThread />
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    );
}

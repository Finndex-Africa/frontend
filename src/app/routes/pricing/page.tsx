"use client";

const tiers = [
    {
        name: "Basic",
        description: "Great for getting started",
        price: "Free",
        features: [
            "Browse property listings",
            "Browse service providers",
            "Save favorites",
            "Basic messaging",
        ],
        cta: "Get Started",
        highlighted: false,
    },
    {
        name: "Premium",
        description: "For landlords and agents",
        price: "Coming Soon",
        features: [
            "Everything in Basic",
            "Unlimited property listings",
            "Featured listings",
            "Priority support",
            "Analytics dashboard",
        ],
        cta: "Coming Soon",
        highlighted: true,
    },
    {
        name: "Business",
        description: "For service providers",
        price: "Coming Soon",
        features: [
            "Everything in Premium",
            "Verified badge",
            "Booking management",
            "Revenue reports",
            "Dedicated account manager",
        ],
        cta: "Coming Soon",
        highlighted: false,
    },
];

export default function PricingPage() {
    return (
            <main className="min-h-screen bg-linear-to-b from-blue-50 to-white pt-8 pb-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Choose the plan that fits your needs. Pricing details will be
                            available soon.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {tiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`rounded-2xl p-8 flex flex-col ${
                                    tier.highlighted
                                        ? "bg-[#0000FF] text-white shadow-2xl scale-105"
                                        : "bg-white text-gray-900 border border-gray-200 shadow-lg"
                                }`}
                            >
                                <h2 className="text-2xl font-bold mb-1">{tier.name}</h2>
                                <p
                                    className={`text-sm mb-6 ${
                                        tier.highlighted ? "text-blue-200" : "text-gray-500"
                                    }`}
                                >
                                    {tier.description}
                                </p>

                                <div className="text-3xl font-extrabold mb-8">
                                    {tier.price}
                                </div>

                                <ul className="flex-1 space-y-3 mb-8">
                                    {tier.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2">
                                            <svg
                                                className={`w-5 h-5 mt-0.5 shrink-0 ${
                                                    tier.highlighted
                                                        ? "text-blue-200"
                                                        : "text-[#0000FF]"
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <span className="text-sm">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    disabled={tier.cta === "Coming Soon"}
                                    className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                                        tier.highlighted
                                            ? "bg-white text-[#0000FF] hover:bg-blue-50"
                                            : tier.cta === "Coming Soon"
                                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                              : "bg-[#0000FF] text-white hover:bg-blue-700"
                                    }`}
                                >
                                    {tier.cta}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-gray-500">
                            Need a custom plan?{" "}
                            <a
                                href="/routes/about"
                                className="text-[#0000FF] font-semibold hover:underline"
                            >
                                Contact us
                            </a>
                        </p>
                    </div>
                </div>
            </main>
    );
}

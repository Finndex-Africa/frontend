import Link from "next/link";

export const metadata = {
  title: "How It Works | FindAfriq",
  description:
    "Learn how FindAfriq connects home seekers with verified landlords and trusted service providers — in just a few simple steps.",
};

const seekerSteps = [
  {
    step: "1",
    icon: "🔍",
    title: "Search & Discover",
    description:
      "Use our powerful search to find verified properties and trusted service providers near you. Filter by location, price, type, and more.",
  },
  {
    step: "2",
    icon: "🏷️",
    title: "Browse Listings",
    description:
      "Explore detailed listings with photos, pricing, amenities, and verified badges — so you always know exactly what you're getting.",
  },
  {
    step: "3",
    icon: "💬",
    title: "Connect & Book",
    description:
      "Message landlords or service providers directly through the platform, ask questions, and book with confidence.",
  },
  {
    step: "4",
    icon: "⭐",
    title: "Leave a Review",
    description:
      "After your experience, share feedback to help others in the community make informed decisions.",
  },
];

const providerSteps = [
  {
    step: "1",
    icon: "📝",
    title: "Create an Account",
    description:
      "Sign up as a landlord or service provider. It only takes a few minutes to get started.",
  },
  {
    step: "2",
    icon: "🏠",
    title: "List Your Property or Service",
    description:
      "Add photos, descriptions, pricing, and availability. Our guided listing process makes it simple.",
  },
  {
    step: "3",
    icon: "✅",
    title: "Get Verified",
    description:
      "Our team reviews your listing to ensure quality and trustworthiness. Verified listings get more visibility.",
  },
  {
    step: "4",
    icon: "📈",
    title: "Reach Thousands of Seekers",
    description:
      "Once live, your listing is visible to thousands of potential clients actively searching for what you offer.",
  },
];

const trustFeatures = [
  {
    icon: "🛡️",
    title: "Verified Listings",
    description:
      "Every property and service is reviewed before going live. No fake listings, no surprises.",
  },
  {
    icon: "🔒",
    title: "Secure Messaging",
    description:
      "Communicate safely within the platform — your personal contact info stays private until you choose to share it.",
  },
  {
    icon: "⭐",
    title: "Community Reviews",
    description:
      "Real ratings and reviews from real users help you make confident, informed choices.",
  },
  {
    icon: "🤝",
    title: "Dedicated Support",
    description:
      "Our team is available to help with any issues, disputes, or questions you have along the way.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-blue-600 py-16 px-4 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          How It Works
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-blue-100">
          FindAfriq makes it simple to find verified properties, book trusted
          services, and connect with the right people — all in one place.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/routes/login"
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/routes/properties"
            className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      </section>

      {/* For Home Seekers */}
      <section className="container-app py-16 px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
            For Home Seekers &amp; Clients
          </span>
          <h2 className="text-3xl font-bold text-gray-900">
            Find what you&apos;re looking for in 4 steps
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {seekerSteps.map((s) => (
            <div
              key={s.step}
              className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow">
                {s.step}
              </div>
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-auto max-w-4xl" />

      {/* For Providers */}
      <section className="container-app py-16 px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
            For Landlords &amp; Service Providers
          </span>
          <h2 className="text-3xl font-bold text-gray-900">
            Start reaching clients in 4 easy steps
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {providerSteps.map((s) => (
            <div
              key={s.step}
              className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow">
                {s.step}
              </div>
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Trust FindAfriq */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why trust FindAfriq?
            </h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              We&apos;re built on transparency, verification, and community.
              Here&apos;s what makes us different.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm"
              >
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-app py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "Is FindAfriq free to use?",
              a: "Browsing properties and services on FindAfriq is completely free. Listing fees may apply for landlords and service providers — check our Pricing page for details.",
            },
            {
              q: "How are listings verified?",
              a: "Our team manually reviews each listing before it goes live. We check documents, photos, and provider identity to ensure everything is legitimate.",
            },
            {
              q: "Can I message a landlord before booking?",
              a: "Yes! You can message any landlord or service provider directly through the platform before committing to anything.",
            },
            {
              q: "What happens if I have an issue with a listing?",
              a: "You can report any listing or user directly from the platform. Our support team reviews all reports and takes action within 24–48 hours.",
            },
            {
              q: "Is my personal information safe?",
              a: "Absolutely. We never share your personal contact details without your consent. All communication happens securely within FindAfriq.",
            },
          ].map((item, i) => (
            <details
              key={i}
              className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-gray-900 hover:bg-gray-50 transition-colors list-none">
                {item.q}
                <svg
                  className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
          Join thousands of people already using FindAfriq to find homes,
          services, and connect with trusted providers across Africa.
        </p>
        <Link
          href="/routes/login"
          className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Create Your Free Account
        </Link>
      </section>
    </div>
  );
}

import TestimonialCard from "./TestimonialCard";

const testimonials = [
    {
        name: "Aïssatou Diallo",
        role: "Property Owner",
        content: "FindAfriq made it incredibly easy to list my property. Within weeks, I had multiple interested tenants. The platform is user-friendly and the support team is excellent!",
        rating: 5,
        avatarUrl: "https://images.unsplash.com/photo-1769636930016-5d9f0ca653aa?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
        name: "Kwame Mensah",
        role: "Service Provider",
        content: "As a plumber, joining FindAfriq was the best business decision I made. I get consistent leads and the verification process helped build trust with my clients.",
        rating: 5,
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
        name: "Aminata Kamara",
        role: "Home Seeker",
        content: "Finding a home in Monrovia was stressful until I discovered FindAfriq. The search filters made it easy to find exactly what I needed, and all properties were verified!",
        rating: 5,
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
        name: "Nia Okafor",
        role: "Property Manager",
        content: "Managing multiple properties became much simpler with FindAfriq. The dashboard is intuitive and I can track everything in one place.",
        rating: 5,
        avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&h=200&q=80"
    }
];

export default function TestimonialsSection() {
    return (
        <div className="bg-gray-100 py-16">
            <div className="container-app">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        What Our <span className="text-blue-600">Community</span> Says
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Join thousands of satisfied users who have found their perfect homes and trusted service providers
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={index}
                            {...testimonial}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

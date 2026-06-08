import TestimonialCard from "./TestimonialCard";

const testimonials = [
    {
        name: "A. Mohammed Kromah",
        role: "FindAfriq Agent",
        content:
            "My experience with FindAfriq has been great. The platform has helped me connect landlords with people searching for apartments and rooms while improving my communication and networking skills. I'm proud to be part of the team and excited to continue growing with FindAfriq.",
        rating: 5,
        avatarUrl: "/images/testimonials/Mohammed.jpeg",
    },
    {
        name: "Lawrence S.D. Daywhea",
        role: "FindAfriq Agent",
        content:
            "Being a verified agent has shown me the opportunities digital platforms create. I'm grateful to be part of FindAfriq and committed to supporting its mission of connecting people with verified properties including apartments and offices.",
        rating: 5,
        avatarUrl: "/images/testimonials/lawrence.jpeg",
    },
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} {...testimonial} />
                    ))}
                </div>
            </div>
        </div>
    );
}

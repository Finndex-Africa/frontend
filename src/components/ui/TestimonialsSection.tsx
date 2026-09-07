"use client";

import { useTranslations } from "next-intl";
import TestimonialCard from "./TestimonialCard";

/**
 * Names, photos and ratings stay in code; the role label and quote come from
 * the catalog (messages/*.json → testimonials).
 */
const testimonials = [
    {
        name: "Aïssatou Diallo",
        roleKey: "propertyOwner",
        quoteKey: "diallo",
        rating: 5,
        avatarUrl: "https://images.unsplash.com/photo-1769636930016-5d9f0ca653aa?auto=format&fit=crop&w=200&h=200&q=80",
    },
    {
        name: "Fine Living Cleaning Service",
        roleKey: "serviceProvider",
        quoteKey: "fineLiving",
        rating: 5,
        avatarUrl: "/images/partners/fine living.jpeg",
    },
    {
        name: "A. Mohammed Kromah",
        roleKey: "agent",
        quoteKey: "kromah",
        rating: 5,
        avatarUrl: "/images/testimonials/Mohammed.jpeg",
    },
    {
        name: "Lawrence S.D. Daywhea",
        roleKey: "agent",
        quoteKey: "daywhea",
        rating: 5,
        avatarUrl: "/images/testimonials/lawrence.jpeg",
    },
] as const;

export default function TestimonialsSection() {
    const t = useTranslations("testimonials");

    return (
        <div className="bg-gray-100 py-16">
            <div className="container-app">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {t("headingPre")}{" "}
                        <span className="text-blue-600">{t("headingHighlight")}</span>
                        {t("headingPost") ? ` ${t("headingPost")}` : ""}
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {testimonials.map((testimonial) => (
                        <TestimonialCard
                            key={testimonial.name}
                            name={testimonial.name}
                            role={t(`roles.${testimonial.roleKey}`)}
                            content={t(`quotes.${testimonial.quoteKey}`)}
                            rating={testimonial.rating}
                            avatarUrl={testimonial.avatarUrl}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

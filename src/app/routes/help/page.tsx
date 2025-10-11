'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Help() {
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    const faqs = [
        {
            question: "How do I create an account?",
            answer: "Click on the 'Sign Up' button on the top right, fill in your details, and follow the verification steps."
        },
        {
            question: "How do I list a property?",
            answer: "After signing in as a landlord or agent, go to your dashboard and select 'Add Property'. Fill in the property details and submit."
        },
        {
            question: "How do I book a service provider?",
            answer: "Browse the services section, select a provider, and click 'Book Now'. You can communicate directly through the platform."
        },
        {
            question: "What payment methods are accepted?",
            answer: "We support bank transfers, mobile money, and major credit/debit cards depending on your location."
        },
        {
            question: "How do I report a problem or scam?",
            answer: "Use the 'Report' button on the listing or provider profile, or contact our support team directly via the contact form below."
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Help Center</h1>
                <p className="text-center text-gray-700 mb-12">
                    Find answers to common questions or reach out to our support team for assistance.
                </p>

                {/* FAQs */}
                <div className="space-y-4 mb-12">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-4 cursor-pointer">
                            <div
                                onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                                className="flex justify-between items-center"
                            >
                                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                                <span className="text-gray-500 font-bold">{faqOpen === index ? "-" : "+"}</span>
                            </div>
                            {faqOpen === index && (
                                <p className="mt-2 text-gray-700">{faq.answer}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-lg shadow p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                placeholder="How can we help you?"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Terms & Conditions</h1>
                <p className="text-gray-700 mb-8 text-center">
                    Welcome to Finndex Africa! Please read these terms carefully before using our platform.
                </p>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
                        <p className="text-gray-700">
                            By accessing or using Finndex Africa’s services, you agree to comply with and be bound by these Terms and Conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">2. Use of Services</h2>
                        <p className="text-gray-700">
                            Users may use the platform to search for properties, service providers, and other related features in compliance with all applicable laws and regulations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">3. Account Registration</h2>
                        <p className="text-gray-700">
                            You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and up-to-date information during registration.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">4. User Conduct</h2>
                        <p className="text-gray-700">
                            Users agree not to engage in fraudulent activities, post false listings, harass other users, or violate any applicable laws while using the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">5. Privacy</h2>
                        <p className="text-gray-700">
                            Your use of Finndex Africa is also governed by our Privacy Policy. Please review it to understand how we collect, use, and protect your personal data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">6. Limitation of Liability</h2>
                        <p className="text-gray-700">
                            Finndex Africa is not liable for any direct or indirect damages arising from the use of the platform, including transactions, listings, or interactions with third-party service providers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">7. Modifications to Terms</h2>
                        <p className="text-gray-700">
                            We reserve the right to update these Terms and Conditions at any time. Continued use of the platform constitutes acceptance of any changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">8. Contact Us</h2>
                        <p className="text-gray-700">
                            If you have any questions regarding these terms, please contact our support team at <a href="mailto:support@finndexafrica.com" className="text-blue-600 underline">support@finndexafrica.com</a>.
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
}

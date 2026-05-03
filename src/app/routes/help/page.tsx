'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import { LegalContactCard, LegalDocLayout } from '@/components/legal/LegalDocLayout';

type FaqItem = { key: string; question: string; answer: ReactNode };

type FaqSection = { id: string; title: string; items: FaqItem[] };

const FAQ_SECTIONS: FaqSection[] = [
    {
        id: 'general',
        title: 'General Questions',
        items: [
            {
                key: 'g1',
                question: 'What is FindAfriq?',
                answer:
                    'FindAfriq is a digital real estate and services platform that connects home seekers with landlords, agents and service providers, making it easier to search, find, and connect in one place.',
            },
            {
                key: 'g2',
                question: 'Who can use FindAfriq?',
                answer:
                    'Individuals looking for properties and house related services, landlords, agents, and those offering household services.',
            },
            {
                key: 'g3',
                question: 'Is FindAfriq free to use?',
                answer:
                    'Yes, browsing the platform is free. However, certain premium features or listings may require payment.',
            },
        ],
    },
    {
        id: 'account',
        title: 'Account & Registration',
        items: [
            {
                key: 'a1',
                question: 'Do I need an account to use FindAfriq?',
                answer:
                    'You can browse without an account, but you’ll need to sign up to post listings, contact providers, or access advanced features.',
            },
            {
                key: 'a2',
                question: 'How do I create an account?',
                answer:
                    'Click on the “Sign In” button and switch to “Sign Up”, fill in your details, and follow the verification process.',
            },
            {
                key: 'a3',
                question: 'Why is my account not verified immediately?',
                answer:
                    'For security and quality assurance, all accounts are reviewed and verified by the admin before full access is granted.',
            },
        ],
    },
    {
        id: 'properties',
        title: 'Properties',
        items: [
            {
                key: 'p1',
                question: 'How do I find a property?',
                answer:
                    'Use the search feature to filter properties based on location, type and budget, or tap the Properties item on the bottom navigation bar (mobile).',
            },
            {
                key: 'p2',
                question: 'Are the properties verified?',
                answer:
                    'Yes, FindAfriq prioritizes verified listings to ensure users get accurate and trustworthy information.',
            },
            {
                key: 'p3',
                question: 'Can I list my property on FindAfriq?',
                answer:
                    'Yes. Simply create an account, submit your property details, and wait for approval.',
            },
        ],
    },
    {
        id: 'services',
        title: 'Service Providers',
        items: [
            {
                key: 's1',
                question: 'What kind of service providers are on FindAfriq?',
                answer:
                    'FindAfriq hosts a variety of service providers including electricians, plumbers, security, cleaners, and more.',
            },
            {
                key: 's2',
                question: 'How do I find services?',
                answer:
                    'Use the search feature to filter services based on location, type and budget, or tap the Services item on the bottom navigation bar (mobile).',
            },
            {
                key: 's3',
                question: 'How do I know a service provider is trustworthy?',
                answer:
                    'All providers go through a verification process, and users can also check ratings and reviews.',
            },
            {
                key: 's4',
                question: 'Can I register as a service provider?',
                answer:
                    'Yes. Sign up, complete your profile, submit required documents, and await approval.',
            },
        ],
    },
    {
        id: 'safety',
        title: 'Safety & Trust',
        items: [
            {
                key: 't1',
                question: 'How does FindAfriq ensure safety?',
                answer:
                    'We verify users and providers, monitor activities, and encourage users to report suspicious behavior.',
            },
            {
                key: 't2',
                question: 'What should I do if I encounter fraud or suspicious activity?',
                answer:
                    'Report immediately through the platform or contact our support team.',
            },
        ],
    },
    {
        id: 'payments',
        title: 'Payments & Transactions',
        items: [
            {
                key: 'pay1',
                question: 'Does FindAfriq handle payments?',
                answer:
                    'Payments made through our platform cover only platform-related usage fees. Fees by agents for property access or by service providers for their services are handled directly between users and those providers. Please confirm all agent or service provider payment terms with them before proceeding.',
            },
            {
                key: 'pay2',
                question: 'Are there any hidden fees?',
                answer: (
                    <>
                        No. All applicable fees are clearly stated on the{' '}
                        <Link href="/routes/pricing" className="text-[#0000FF] font-medium hover:underline">
                            pricing page
                        </Link>
                        .
                    </>
                ),
            },
        ],
    },
    {
        id: 'support',
        title: 'Support',
        items: [
            {
                key: 'sup1',
                question: 'How can I contact FindAfriq support?',
                answer:
                    'You can reach us via email, in-app support, or our official social media channels.',
            },
            {
                key: 'sup2',
                question: 'What if I need help using the platform?',
                answer:
                    'Our support team is available to guide you through any challenges.',
            },
        ],
    },
    {
        id: 'other',
        title: 'Other Questions',
        items: [
            {
                key: 'o1',
                question: 'Can I leave reviews?',
                answer:
                    'Yes. Users are encouraged to leave honest reviews to help others make informed decisions.',
            },
            {
                key: 'o2',
                question: 'Can I update or delete my account?',
                answer:
                    'Yes. You can manage your account settings or contact support for assistance.',
            },
        ],
    },
];

function sectionToCollapseItems(section: FaqSection, sectionIndex: number): NonNullable<CollapseProps['items']> {
    let n = 1;
    for (let i = 0; i < sectionIndex; i++) {
        n += FAQ_SECTIONS[i].items.length;
    }
    return section.items.map((item, i) => ({
        key: item.key,
        label: (
            <span className="text-left font-medium text-gray-900 pr-2">
                {n + i}. {item.question}
            </span>
        ),
        children: (
            <div className="text-gray-700 text-[15px] leading-relaxed border-t border-gray-100 pt-3 -mt-1">
                {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
            </div>
        ),
    }));
}

export default function HelpFaqPage() {
    return (
        <LegalDocLayout
            title="FindAfriq — Frequently Asked Questions (FAQ)"
            subtitle="Connecting you seamlessly — Find verified properties and trusted service providers across Africa."
        >
            <div className="space-y-8">
                {FAQ_SECTIONS.map((section, sectionIndex) => (
                    <section key={section.id} id={section.id} className="scroll-mt-24">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-heading border-b border-gray-200 pb-2">
                            {section.title}
                        </h2>
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <Collapse
                                accordion
                                bordered={false}
                                expandIconPosition="end"
                                className="faq-collapse bg-white [&_.ant-collapse-item]:border-gray-100"
                                items={sectionToCollapseItems(section, sectionIndex)}
                            />
                        </div>
                    </section>
                ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-2 font-heading">Contact us</h2>
                <p className="text-gray-600 text-sm mb-6">
                    Still need help? Send us a message and we’ll get back to you.
                </p>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            placeholder="Your name"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0000FF]/30 focus:border-[#0000FF] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0000FF]/30 focus:border-[#0000FF] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                            placeholder="How can we help you?"
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0000FF]/30 focus:border-[#0000FF] outline-none resize-y min-h-[100px]"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto bg-[#0000FF] text-white py-3 px-8 rounded-lg font-semibold text-sm hover:opacity-95 transition-opacity"
                    >
                        Submit
                    </button>
                </form>
            </div>

            <LegalContactCard />
        </LegalDocLayout>
    );
}

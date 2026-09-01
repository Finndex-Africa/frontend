'use client';

import { useTranslations } from "next-intl";
import type { ReactNode } from 'react';
import { Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import { LegalContactCard, LegalDocLayout } from '@/components/legal/LegalDocLayout';

import { Link } from '@/i18n/navigation';
type FaqItem = { key: string; question: string; answer: ReactNode };

type FaqSection = { id: string; title: string; items: FaqItem[] };

function sectionToCollapseItems(
    section: FaqSection,
    sectionIndex: number,
    allSections: FaqSection[],
): NonNullable<CollapseProps['items']> {
    let n = 1;
    for (let i = 0; i < sectionIndex; i++) {
        n += allSections[i].items.length;
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
    const t = useTranslations("helpPage");
    // FAQ copy lives in the catalog; ids/keys stay in code for anchors.
    const FAQ_SECTIONS = t.raw("sections") as FaqSection[];
    return (
        <LegalDocLayout
            title={t("pageTitle")}
            subtitle={t("subtitle")}
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
                                items={sectionToCollapseItems(section, sectionIndex, FAQ_SECTIONS)}
                            />
                        </div>
                    </section>
                ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-2 font-heading">{t("contactUs")}</h2>
                <p className="text-gray-600 text-sm mb-6">
                    {t("stillNeedHelp")}
                </p>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            placeholder={t("yourName")}
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
                            placeholder={t("howCanWeHelp")}
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0000FF]/30 focus:border-[#0000FF] outline-none resize-y min-h-[100px]"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto bg-[#0000FF] text-white py-3 px-8 rounded-lg font-semibold text-sm hover:opacity-95 transition-opacity"
                    >
                        {t("submit")}
                    </button>
                </form>
            </div>

            <LegalContactCard />
        </LegalDocLayout>
    );
}

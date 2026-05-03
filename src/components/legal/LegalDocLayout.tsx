import type { ReactNode } from 'react';

export function LegalDocLayout({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-linear-to-br from-blue-900/90 via-slate-900 to-slate-950" />
                <div className="relative container-app px-4 py-12 sm:py-16 text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                        {title}
                    </h1>
                    {subtitle ? (
                        <p className="mt-3 text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
                            {subtitle}
                        </p>
                    ) : null}
                </div>
            </header>
            <article className="container-app px-4 py-10 sm:py-14">
                <div className="max-w-4xl mx-auto space-y-10 text-gray-800 leading-relaxed">{children}</div>
            </article>
        </div>
    );
}

export function LegalSection({
    id,
    title,
    children,
}: {
    id?: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-heading">{title}</h2>
            <div className="space-y-3 text-gray-700 text-[15px] sm:text-base text-left">{children}</div>
        </section>
    );
}

export function LegalSubheading({ children }: { children: ReactNode }) {
    return <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2 font-heading">{children}</h3>;
}

export function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="list-disc pl-5 space-y-2 text-gray-700 text-left">
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
}

export function PolicyTable({
    headers,
    rows,
    caption,
}: {
    headers: string[];
    rows: string[][];
    caption?: string;
}) {
    return (
        <div className="my-6">
            {caption ? <p className="mb-2 text-xs text-gray-500">{caption}</p> : null}
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-100">
                <table className="min-w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-blue-50/80">
                            {headers.map((h) => (
                                <th
                                    key={h}
                                    scope="col"
                                    className="px-4 py-3 font-semibold text-gray-900 first:rounded-tl-xl last:rounded-tr-xl"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50/80">
                                {row.map((cell, j) => (
                                    <td key={j} className="px-4 py-3 text-gray-700 align-top">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function LegalContactCard() {
    return (
        <div className="rounded-2xl border border-gray-200 bg-slate-50 p-6 sm:p-8 ring-1 ring-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Contact</p>
            <p className="mt-2 text-gray-700">
                <span className="font-semibold text-gray-900">FindAfriq</span>
                <br />
                Paynesville City, Montserrado County
                <br />
                Website:{' '}
                <a href="https://www.findafriq.com" className="text-[#0000FF] font-medium hover:underline">
                    www.findafriq.com
                </a>
                <br />
                Tel: +231 779 922 382 · WhatsApp: +231 886 149 219
                <br />
                Email:{' '}
                <a href="mailto:findafriq@gmail.com" className="text-[#0000FF] font-medium hover:underline">
                    findafriq@gmail.com
                </a>
                <br />
                FB, LinkedIn &amp; YouTube: @Findafriq ·{' '}
                <a
                    href="https://www.youtube.com/@Findafriq"
                    className="text-[#0000FF] font-medium hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    youtube.com/@Findafriq
                </a>
            </p>
        </div>
    );
}

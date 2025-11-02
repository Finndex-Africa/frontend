import Image from "next/image";

type Stat = {
    value: string;
    label: string;
};

type StatsSectionProps = {
    imageUrl: string;
    imageAlt?: string;
    title: string;
    subtitle?: string;
    stats: Stat[];
    height?: string;
};

export default function StatsSection({
    imageUrl,
    imageAlt = "Background image",
    title,
    subtitle,
    stats,
    height = "h-100"
}: StatsSectionProps) {
    return (
        <section className="relative my-8">
            <div className="container-app">
                <div className={`relative ${height} w-full overflow-hidden rounded-2xl`}>
                    <Image src={imageUrl} alt={imageAlt} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 h-full flex items-center justify-between px-6 md:px-12 text-white">
                        <div className="max-w-lg">
                            <div className="text-3xl md:text-4xl font-extrabold">{title}</div>
                            {subtitle && (
                                <p className="mt-2 text-lg opacity-90">{subtitle}</p>
                            )}
                        </div>
                        {stats.length > 0 && (
                            <div className="hidden md:flex gap-12">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-right">
                                        <div className="text-4xl font-extrabold">{stat.value}</div>
                                        <div className="opacity-90 mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

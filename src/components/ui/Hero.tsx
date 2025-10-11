import Image from "next/image";
import { ReactNode } from "react";

type HeroProps = {
    imageUrl: string;
    imageAlt?: string;
    title: string;
    subtitle?: string;
    height?: string;
    overlay?: boolean;
    children?: ReactNode;
};

export default function Hero({
    imageUrl,
    imageAlt = "Hero image",
    title,
    subtitle,
    height = "h-[440px]",
    overlay = true,
    children
}: HeroProps) {
    return (
        <section className={`relative ${height} w-full overflow-hidden`}>
            <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
            {overlay && <div className="absolute inset-0 bg-black/40" />}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
                <h1 className="text-3xl md:text-5xl font-extrabold max-w-4xl leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-4 text-lg md:text-xl max-w-2xl">{subtitle}</p>
                )}
                {children && <div className="mt-6 w-full">{children}</div>}
            </div>
        </section>
    );
}

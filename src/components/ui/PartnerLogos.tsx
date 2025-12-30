import Image from 'next/image';

type Partner = {
    name: string;
    logoUrl: string;
};

type PartnerLogosProps = {
    partners: Partner[];
    grayscale?: boolean;
};

export default function PartnerLogos({
    partners,
}: PartnerLogosProps) {
    return (
        <div className="w-full overflow-hidden py-4 sm:py-6">
            <div className="flex items-center gap-8 sm:gap-12 md:gap-16 animate-scroll">
                {/* First set of logos */}
                {partners.map((partner, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-center min-w-[180px] sm:min-w-[220px] md:min-w-[260px] flex-shrink-0 relative h-28 sm:h-32 md:h-40"
                    >
                        <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            fill
                            className="object-cover opacity-50 hover:opacity-100 transition-opacity duration-300"
                        />
                    </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {partners.map((partner, index) => (
                    <div
                        key={`duplicate-${index}`}
                        className="flex items-center justify-center min-w-[180px] sm:min-w-[220px] md:min-w-[260px] flex-shrink-0 relative h-28 sm:h-32 md:h-40"
                    >
                        <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            fill
                            className="object-cover opacity-50 hover:opacity-100 transition-opacity duration-300"
                        />
                    </div>
                ))}
            </div>
            <style jsx>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-scroll {
                    animation: scroll 35s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>

    );
}

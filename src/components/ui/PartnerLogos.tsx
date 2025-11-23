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
        <div className="w-full overflow-hidden py-4">
            <div className="flex items-center gap-12 animate-scroll">
                {/* First set of logos */}
                {partners.map((partner, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-center h-12 min-w-[100px] flex-shrink-0"
                    >
                        <img
                            src={partner.logoUrl}
                            alt={partner.name}
                            className="h-full w-auto object-contain opacity-40 hover:opacity-100 transition-opacity duration-300"
                        />
                    </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {partners.map((partner, index) => (
                    <div
                        key={`duplicate-${index}`}
                        className="flex items-center justify-center h-12 min-w-[100px] flex-shrink-0"
                    >
                        <img
                            src={partner.logoUrl}
                            alt={partner.name}
                            className="h-full w-auto object-contain opacity-40 hover:opacity-100 transition-opacity duration-300"
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

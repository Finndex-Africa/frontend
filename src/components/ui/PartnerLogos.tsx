import Image from "next/image";

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
        <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:auto-cols-max md:grid-flow-col gap-12 items-center justify-center">
                {partners.map((partner, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-center h-26 w-40"
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                                src={partner.logoUrl}
                                alt={partner.name}
                                fill
                                className='object-contain'
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

    );
}

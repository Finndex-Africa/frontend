import Card, { CardContent } from "../../components/ui/Card";
import Image from "next/image";

export type ServiceProvider = {
    id: string;
    name: string;
    services: string[];
    location: string;
    contact: string;
    verified?: boolean;
    logoUrl?: string;
    imageUrl?: string;
};

export default function ServiceProviderCard({ sp }: { sp: ServiceProvider }) {
    return (
        <Card interactive>
            <div className="relative h-36 w-full">
                <Image
                    src={sp.imageUrl || sp.logoUrl || "https://images.unsplash.com/photo-1581091215367-59ab6b11b3d6"}
                    alt={sp.name}
                    fill
                    className="object-cover"
                />
            </div>
            <CardContent>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="font-semibold flex items-center gap-2">
                            {sp.name}
                            {sp.verified && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Verified</span>}
                        </div>
                        <div className="text-sm text-gray-600">{sp.location}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {sp.services.map((s) => (
                                <span key={s} className="text-xs bg-gray-100 rounded px-2 py-0.5">{s}</span>
                            ))}
                        </div>
                    </div>
                    <a className="btn btn-secondary" href={`mailto:${sp.contact}`}>Contact</a>
                </div>
            </CardContent>
        </Card>
    );
}




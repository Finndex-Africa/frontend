import Image from "next/image";

type TestimonialCardProps = {
    name: string;
    role: string;
    content: string;
    avatarUrl?: string;
    rating?: number;
};

export default function TestimonialCard({
    name,
    role,
    content,
    avatarUrl,
    rating
}: TestimonialCardProps) {
    return (
        <div className="card p-6 h-full">
            <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                        <Image src={avatarUrl} alt={name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-semibold text-lg">
                            {name.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-gray-900">{name}</div>
                    <div className="text-xs text-gray-500">{role}</div>
                </div>
                {rating && (
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                        <span className="text-amber-500">⭐</span>
                        <span className="text-sm font-semibold text-amber-700">{rating}</span>
                    </div>
                )}
            </div>
            <p className="mt-4 text-gray-700 leading-relaxed">{content}</p>
        </div>
    );
}

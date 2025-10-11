import { ReactNode } from "react";

type SectionHeaderProps = {
    title: string;
    highlightText?: string;
    subtitle?: string;
    action?: ReactNode;
    centered?: boolean;
};

export default function SectionHeader({
    title,
    highlightText,
    subtitle,
    action,
    centered = false
}: SectionHeaderProps) {
    return (
        <div className={`flex ${centered ? 'flex-col items-center text-center' : 'items-end justify-between'} gap-4`}>
            <div>
                <h2 className="text-2xl md:text-3xl font-extrabold">
                    {title}{" "}
                    {highlightText && (
                        <span className="text-blue-700">{highlightText}</span>
                    )}
                </h2>
                {subtitle && (
                    <p className="text-gray-600 mt-1">{subtitle}</p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

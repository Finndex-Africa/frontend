"use client";
import { useState } from "react";

type Category = {
    id: string;
    label: string;
    icon: string;
};

const categories: Category[] = [
    { id: "amazing-views", label: "Amazing views", icon: "🏔️" },
    { id: "lakefront", label: "Lakefront", icon: "🏖️" },
    { id: "trending", label: "Trending", icon: "🔥" },
    { id: "design", label: "Design", icon: "✨" },
    { id: "beachfront", label: "Beachfront", icon: "🏝️" },
    { id: "countryside", label: "Countryside", icon: "🌾" },
    { id: "amazing-pools", label: "Amazing pools", icon: "🏊" },
    { id: "cabins", label: "Cabins", icon: "🛖" },
    { id: "luxe", label: "Luxe", icon: "💎" },
    { id: "tiny-homes", label: "Tiny homes", icon: "🏠" },
];

export default function CategoryFilter() {
    const [activeCategory, setActiveCategory] = useState<string>("amazing-views");

    return (
        <div className="border-b border-gray-200">
            <div className="container-app">
                <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide py-4">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex flex-col items-center gap-2 pb-3 border-b-2 transition-all flex-shrink-0 ${
                                activeCategory === category.id
                                    ? "border-gray-900 text-gray-900"
                                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200"
                            }`}
                        >
                            <span className="text-2xl">{category.icon}</span>
                            <span className="text-xs font-medium whitespace-nowrap">{category.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

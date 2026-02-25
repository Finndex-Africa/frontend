"use client";
import React from "react";
import Button from "@/components/ui/Button";

export type Filters = {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    rooms?: number;
    type?: string;
    furnished?: boolean;
};

type Props = {
    value: Filters;
    onChange: (v: Filters) => void;
    onSubmit: () => void;
};

export default function SearchFilters({ value, onChange, onSubmit }: Props) {
    return (
        <div className="card p-4 md:p-5 grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl shadow-xl">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">Location</label>
                <input
                    className="input h-12 placeholder-gray-400"
                    placeholder="Search location"
                    value={value.location || ""}
                    onChange={(e) => onChange({ ...value, location: e.target.value })}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">Select Preference</label>
                <select
                    className="input h-12"
                    value={value.type || ""}
                    onChange={(e) => onChange({ ...value, type: e.target.value })}
                >
                    <option value="">Property Type</option>
                    <option>Apartment</option>
                    <option>Office Space</option>
                    <option>Studio</option>
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">Budget</label>
                <input
                    className="input h-12 placeholder-gray-400"
                    type="number"
                    placeholder="Determine Your Budget"
                    value={value.maxPrice ?? ""}
                    onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) || undefined })}
                />
            </div>

            <div className="flex items-end">
                <Button onClick={onSubmit} className="w-full h-12">Search</Button>
            </div>
        </div>
    );
}




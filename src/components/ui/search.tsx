"use client";
import { useState } from "react";

type SearchTab = "stays" | "experiences";

export default function Search() {
    const [activeTab, setActiveTab] = useState<SearchTab>("stays");

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2">
                <div className="flex items-center divide-x divide-gray-300">
                    <div className="flex-1 px-6 py-3 cursor-pointer hover:bg-gray-50 rounded-full transition-colors">
                        <div className="text-xs font-semibold text-gray-900">Where</div>
                        <input
                            type="text"
                            placeholder="Search destinations"
                            className="w-full text-sm text-gray-600 bg-transparent border-none outline-none placeholder-gray-400"
                        />
                    </div>

                    <div className="px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="text-xs font-semibold text-gray-900">Check in</div>
                        <div className="text-sm text-gray-400">Add dates</div>
                    </div>

                    <div className="px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="text-xs font-semibold text-gray-900">Check out</div>
                        <div className="text-sm text-gray-400">Add dates</div>
                    </div>

                    <div className="flex items-center gap-3 pl-6 pr-2 py-3 cursor-pointer hover:bg-gray-50 rounded-full transition-colors flex-1">
                        <div className="flex-1">
                            <div className="text-xs font-semibold text-gray-900">Who</div>
                            <div className="text-sm text-gray-400">Add guests</div>
                        </div>
                        <button className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-full hover:from-pink-600 hover:to-red-600 transition-all shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

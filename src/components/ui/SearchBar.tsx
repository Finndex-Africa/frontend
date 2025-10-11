"use client";
import { useState } from "react";

export default function SearchBar() {
    const [activeTab, setActiveTab] = useState<"homes" | "services">("homes");

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Tabs */}
            <div className="flex justify-center mb-4">
                <div className="bg-blue-600 rounded-full p-1 inline-flex gap-1">
                    <button
                        onClick={() => setActiveTab("homes")}
                        className={`px-8 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === "homes"
                            ? "bg-white text-blue-600"
                            : "bg-blue-600 text-white"
                            }`}
                    >
                        Homes
                    </button>
                    <button
                        onClick={() => setActiveTab("services")}
                        className={`px-8 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === "services"
                            ? "bg-white text-blue-600"
                            : "bg-blue-600 text-white"
                            }`}
                    >
                        Services
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Where */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Where
                        </label>
                        <div className="relative">
                            <select className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-lg text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                <option value="">Select location</option>
                                <option>Monrovia, Liberia</option>
                                <option>Accra, Ghana</option>
                                <option>Lagos, Nigeria</option>
                                <option>Nairobi, Kenya</option>
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* When */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            When
                        </label>
                        <input
                            type="date"
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg text-gray-600 bg-white cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="mm/dd/yy"
                        />
                    </div>

                    {/* Service */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Service
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Services"
                                className="w-full h-12 px-4 border border-gray-300 rounded-lg text-gray-600 bg-white placeholder-gray-400 hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* Search Button */}
                    <div>
                        <button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg">
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"homes" | "services">("homes");
    const [location, setLocation] = useState("");
    const [type, setType] = useState("");
    const [budget, setBudget] = useState("");

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const params = new URLSearchParams();

        if (location.trim()) params.append('location', location.trim());
        if (type) {
            // Use 'type' for properties, 'category' for services
            const paramName = activeTab === "homes" ? "type" : "category";
            params.append(paramName, type);
        }
        if (budget) params.append('maxPrice', budget);

        // Navigate to appropriate page with search params
        const targetPath = activeTab === "homes" ? "/routes/properties" : "/routes/services";
        const queryString = params.toString();
        router.push(`${targetPath}${queryString ? `?${queryString}` : ''}`);
    };

    // Reset filters when switching tabs
    const handleTabChange = (tab: "homes" | "services") => {
        setActiveTab(tab);
        setLocation("");
        setType("");
        setBudget("");
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-0">
            {/* Tabs */}
            <div className="flex justify-center mb-4">
                <div className="bg-blue-600 rounded-full p-1 inline-flex gap-1">
                    <button
                        onClick={() => handleTabChange("homes")}
                        className={`px-4 sm:px-8 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === "homes"
                            ? "bg-white text-blue-600"
                            : "bg-blue-600 text-white"
                            }`}
                    >
                        Homes
                    </button>
                    <button
                        onClick={() => handleTabChange("services")}
                        className={`px-4 sm:px-8 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === "services"
                            ? "bg-white text-blue-600"
                            : "bg-blue-600 text-white"
                            }`}
                    >
                        Services
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                <form onSubmit={handleSearch}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        {/* Location */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Location
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Search location"
                                className="w-full h-12 px-4 border border-gray-300 rounded-lg text-gray-600 bg-white placeholder-gray-400 hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Property Type / Service Type */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {activeTab === "homes" ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    )}
                                </svg>
                                {activeTab === "homes" ? "Property Type" : "Service Type"}
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-lg text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Select type</option>
                                {activeTab === "homes" ? (
                                    <>
                                        <option value="Apartment">Apartment</option>
                                        <option value="House">House</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="electrical">Electrical</option>
                                        <option value="plumbing">Plumbing</option>
                                        <option value="cleaning">Cleaning</option>
                                        <option value="painting_decoration">Painting</option>
                                        <option value="carpentry_furniture">Carpentry</option>
                                        <option value="moving_logistics">Moving</option>
                                        <option value="security_services">Security</option>
                                        <option value="maintenance">Maintenance</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Budget
                            </label>
                            <input
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="Determine Your Budget"
                                className="w-full h-12 px-4 border border-gray-300 rounded-lg text-gray-600 bg-white placeholder-gray-400 hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Search Button */}
                        <div>
                            <button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

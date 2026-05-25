"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"homes" | "services">("homes");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [serviceName, setServiceName] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();

    if (location.trim()) params.append("location", location.trim());
    if (type) {
      const paramName = activeTab === "homes" ? "type" : "category";
      params.append(paramName, type);
    }
    if (activeTab === "homes" && budget) {
      params.append("maxPrice", budget);
    }
    if (activeTab === "services" && serviceName.trim()) {
      params.append("q", serviceName.trim());
    }

    const targetPath =
      activeTab === "homes" ? "/routes/properties" : "/routes/services";
    const queryString = params.toString();
    router.push(`${targetPath}${queryString ? `?${queryString}` : ""}`);
  };

  const handleTabChange = (tab: "homes" | "services") => {
    setActiveTab(tab);
    setLocation("");
    setType("");
    setBudget("");
    setServiceName("");
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex justify-center mb-2 sm:mb-3">
        <div className="bg-blue-600 rounded-full p-1 inline-flex gap-1">
          <button
            onClick={() => handleTabChange("homes")}
            className={`px-4 sm:px-8 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === "homes"
                ? "bg-white text-blue-600"
                : "bg-blue-600 text-white"
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => handleTabChange("services")}
            className={`px-4 sm:px-8 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === "services"
                ? "bg-white text-blue-600"
                : "bg-blue-600 text-white"
            }`}
          >
            Services
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 items-end">
            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or area (e.g. Thinker's Village)"
                className="w-full h-11 sm:h-12 px-3 sm:px-4 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-600 bg-white placeholder-gray-400 hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Property Type / Service Type */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {activeTab === "homes" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  )}
                </svg>
                {activeTab === "homes" ? "Property Type" : "Service Type"}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-11 sm:h-12 px-3 sm:px-4 pr-8 sm:pr-10 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select type</option>
                {activeTab === "homes" ? (
                  <>
                    <option value="Apartment">Apartment</option>
                    <option value="Office Space">Office Space</option>
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

            {/* Budget (properties) or Service Name (services) */}
            <div>
              {activeTab === "homes" ? (
                <>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Budget (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">
                      $
                    </span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="Max budget"
                      className="w-full h-11 sm:h-12 pl-7 sm:pl-8 pr-3 sm:pr-4 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-600 bg-white placeholder-gray-400 hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Search by service name"
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-600 bg-white placeholder-gray-400 hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </>
              )}
            </div>

            {/* Search Button */}
            <div className="sm:col-span-2 md:col-span-1">
              <button
                type="submit"
                className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
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

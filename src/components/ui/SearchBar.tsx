"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Home, Briefcase, DollarSign, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROPERTY_TYPES = [
  { value: "Apartment", label: "Apartment" },
  { value: "Office Space", label: "Office Space" },
  { value: "House", label: "House" },
  { value: "Studio", label: "Studio" },
  { value: "Commercial", label: "Commercial" },
];

const SERVICE_CATEGORIES = [
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "cleaning", label: "Cleaning" },
  { value: "painting_decoration", label: "Painting & Decoration" },
  { value: "carpentry_furniture", label: "Carpentry & Furniture" },
  { value: "moving_logistics", label: "Moving & Logistics" },
  { value: "security_services", label: "Security Services" },
  { value: "maintenance", label: "Maintenance" },
  { value: "catering", label: "Catering" },
  { value: "construction", label: "Construction" },
  { value: "laundry", label: "Laundry" },
];

export type SearchBarVariant = "home" | "properties" | "services";

export type SearchBarProps = {
  variant?: SearchBarVariant;
  initialLocation?: string;
  initialType?: string;
  initialBudget?: string;
  initialServiceName?: string;
};

export default function SearchBar({
  variant = "home",
  initialLocation = "",
  initialType = "",
  initialBudget = "",
  initialServiceName = "",
}: SearchBarProps) {
  const router = useRouter();
  const isServices = variant === "services";
  const activeTab: "homes" | "services" =
    variant === "services" ? "services" : "homes";
  const showTabs = variant === "home";

  const [isOpen, setIsOpen] = useState(false);
  const [homeTab, setHomeTab] = useState<"homes" | "services">("homes");
  const resolvedTab = showTabs ? homeTab : activeTab;

  const [location, setLocation] = useState(initialLocation);
  const [type, setType] = useState(initialType);
  const [budget, setBudget] = useState(initialBudget);
  const [serviceName, setServiceName] = useState(initialServiceName);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocation(initialLocation);
    setType(initialType);
    setBudget(initialBudget);
    setServiceName(initialServiceName);
  }, [initialLocation, initialType, initialBudget, initialServiceName]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTargetPath = () =>
    variant === "properties"
      ? "/routes/properties"
      : variant === "services"
        ? "/routes/services"
        : resolvedTab === "homes"
          ? "/routes/properties"
          : "/routes/services";

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);

    const params = new URLSearchParams();
    if (location.trim()) params.append("location", location.trim());
    if (type) {
      const paramName = resolvedTab === "homes" ? "type" : "category";
      params.append(paramName, type);
    }
    if (resolvedTab === "homes" && budget) params.append("maxPrice", budget);
    if (resolvedTab === "services" && serviceName.trim()) params.append("q", serviceName.trim());

    const queryString = params.toString();
    router.push(`${getTargetPath()}${queryString ? `?${queryString}` : ""}`);
  };

  const handleTabChange = (tab: "homes" | "services") => {
    setHomeTab(tab);
    setType("");
    setBudget("");
    setServiceName("");
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocation("");
    setType("");
    setBudget("");
    setServiceName("");
    setIsOpen(false);

    if (variant === "properties" || variant === "services") {
      router.push(getTargetPath());
    }
  };

  const getSummaryText = () => {
    const parts: string[] = [];
    if (location.trim()) parts.push(location.trim());
    if (type) {
      parts.push(
        resolvedTab === "homes"
          ? PROPERTY_TYPES.find((t) => t.value === type)?.label ?? type
          : SERVICE_CATEGORIES.find((c) => c.value === type)?.label ?? type,
      );
    }
    if (resolvedTab === "homes" && budget) parts.push(`Max $${budget}`);
    if (resolvedTab === "services" && serviceName.trim()) parts.push(serviceName.trim());
    return parts.join(" · ");
  };

  const placeholder =
    variant === "properties"
      ? "Search properties, locations..."
      : variant === "services"
        ? "Search services, locations..."
        : "Search properties, locations or services...";

  const hasFilters = location || type || budget || serviceName;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? "z-[60]" : "z-30"}`}
    >
      <div
        className="cursor-text overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:rounded-2xl"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <div className="flex items-center gap-1.5 px-3 py-2 sm:gap-2 sm:px-5 sm:py-3.5">
          <Search className="h-4 w-4 shrink-0 text-blue-600 sm:h-5 sm:w-5" />
          <input
            ref={inputRef}
            type="text"
            value={isOpen ? location : getSummaryText() || ""}
            onChange={(e) => {
              setLocation(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none sm:text-sm"
          />
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {hasFilters && !isOpen && (
              <button
                onClick={clearAll}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 sm:p-1.5"
                aria-label="Clear filters"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSearch();
              }}
              className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:h-9 sm:px-4 sm:text-sm"
            >
              Search
            </button>
          </div>
        </div>

        {!isOpen && hasFilters && (
          <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2 sm:gap-2 sm:px-5 sm:pb-3">
            <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
            {!showTabs && (
              <span className="text-xs font-medium text-blue-700">
                {isServices ? "Services" : "Properties"}
              </span>
            )}
            {showTabs && (
              <span className="text-xs font-medium text-blue-700">
                {resolvedTab === "homes" ? "Properties" : "Services"}
              </span>
            )}
            {location && (
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                {location}
              </span>
            )}
            {type && (
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                {resolvedTab === "homes"
                  ? PROPERTY_TYPES.find((t) => t.value === type)?.label
                  : SERVICE_CATEGORIES.find((c) => c.value === type)?.label}
              </span>
            )}
            {resolvedTab === "homes" && budget && (
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                Max ${budget}
              </span>
            )}
            {resolvedTab === "services" && serviceName && (
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                {serviceName}
              </span>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 z-[100] mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-black/10"
          >
            <form onSubmit={handleSearch}>
              {showTabs && (
                <div className="flex border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleTabChange("homes")}
                    className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                      resolvedTab === "homes"
                        ? "border-b-2 border-blue-600 bg-blue-50/50 text-blue-600"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    Properties
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("services")}
                    className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                      resolvedTab === "services"
                        ? "border-b-2 border-blue-600 bg-blue-50/50 text-blue-600"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    Services
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or area…"
                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    {resolvedTab === "homes" ? (
                      <Home className="h-3.5 w-3.5" />
                    ) : (
                      <Briefcase className="h-3.5 w-3.5" />
                    )}
                    {resolvedTab === "homes" ? "Property Type" : "Service Category"}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All types</option>
                    {(resolvedTab === "homes" ? PROPERTY_TYPES : SERVICE_CATEGORIES).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  {resolvedTab === "homes" ? (
                    <>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <DollarSign className="h-3.5 w-3.5" />
                        Max Budget (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                          $
                        </span>
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          placeholder="Any price"
                          className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-6 pr-3 text-sm text-gray-700 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <Search className="h-3.5 w-3.5" />
                        Service Name
                      </label>
                      <input
                        type="text"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="Search by name…"
                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm font-medium text-gray-500 underline underline-offset-2 hover:text-gray-700"
                >
                  Clear all
                </button>
                <button
                  type="submit"
                  className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" />
                  Search {resolvedTab === "homes" ? "Properties" : "Services"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

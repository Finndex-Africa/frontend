"use client";

type Tab = {
    label: string;
    value: string;
};

type TabToggleProps = {
    tabs: Tab[];
    activeTab: string;
    onChange: (value: string) => void;
};

export default function TabToggle({ tabs, activeTab, onChange }: TabToggleProps) {
    return (
        <div className="bg-white rounded-full p-1 inline-flex gap-1 shadow-lg">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                        activeTab === tab.value
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

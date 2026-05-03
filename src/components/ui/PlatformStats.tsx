"use client";
import { useEffect, useState, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Stats {
    totalProperties: number;
    approvedProperties: number;
    totalServices: number;
    totalUsers: number;
}

const DURATION_MS = 1200;

function useCountUp(end: number, enabled: boolean) {
    const [value, setValue] = useState(0);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        if (!enabled || end === 0) {
            setValue(end);
            return;
        }
        startRef.current = null;
        setValue(0);

        const tick = (timestamp: number) => {
            if (startRef.current == null) startRef.current = timestamp;
            const elapsed = timestamp - startRef.current;
            const t = Math.min(elapsed / DURATION_MS, 1);
            const easeOut = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(easeOut * end));
            if (t < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [end, enabled]);

    return value;
}

function StatCard({
    icon,
    iconBg,
    value,
    loading,
    label,
    formatNum,
}: {
    icon: React.ReactNode;
    iconBg: string;
    value: number;
    loading: boolean;
    label: string;
    formatNum: (n: number) => string;
}) {
    const displayValue = useCountUp(value, !loading && value >= 0);
    return (
        <div className="text-center">
            <div className="flex items-center justify-center mb-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1 min-h-9 flex items-center justify-center">
                {loading ? (
                    <span className="text-gray-400 text-base font-medium">Loading...</span>
                ) : (
                    formatNum(displayValue)
                )}
            </div>
            <div className="text-sm text-gray-600 font-medium">{label}</div>
        </div>
    );
}

export default function PlatformStats() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(false);
        fetch(`${API_URL}/properties/public/stats`)
            .then(res => res.json())
            .then(data => {
                const d = data?.data;
                if (!d || typeof d !== 'object') {
                    setStats(null);
                    return;
                }
                const row = d as Record<string, unknown>;
                setStats({
                    totalProperties: Number(row.totalProperties) || 0,
                    approvedProperties: Number(row.approvedProperties) || 0,
                    totalServices:
                        row.totalServices !== undefined
                            ? Number(row.totalServices) || 0
                            : Number(row.totalServiceProviders) || 0,
                    totalUsers: Number(row.totalUsers) || 0,
                });
            })
            .catch(() => {
                setError(true);
                setStats({ totalProperties: 0, approvedProperties: 0, totalServices: 0, totalUsers: 0 });
            })
            .finally(() => setLoading(false));
    }, []);

    const formatNum = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));

    const HouseIcon = (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
    const BriefcaseIcon = (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
    const UsersIcon = (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );

    return (
        <div className="bg-white py-6">
            <div className="container-app">
                <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-900">
                    Our Platform at a Glance
                </h2>
                <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
                    <StatCard
                        icon={HouseIcon}
                        iconBg="bg-blue-100"
                        value={stats?.approvedProperties ?? 0}
                        loading={loading}
                        label="Properties Listed"
                        formatNum={formatNum}
                    />
                    <StatCard
                        icon={BriefcaseIcon}
                        iconBg="bg-purple-100"
                        value={stats?.totalServices ?? 0}
                        loading={loading}
                        label="Services Listed"
                        formatNum={formatNum}
                    />
                    <StatCard
                        icon={UsersIcon}
                        iconBg="bg-green-100"
                        value={stats?.totalUsers ?? 0}
                        loading={loading}
                        label="Total Users"
                        formatNum={formatNum}
                    />
                </div>
            </div>
        </div>
    );
}

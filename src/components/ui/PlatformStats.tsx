"use client";
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Stats {
    totalProperties: number;
    approvedProperties: number;
    totalServiceProviders: number;
    totalUsers: number;
}

export default function PlatformStats() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/properties/public/stats`)
            .then(res => res.json())
            .then(data => setStats(data.data))
            .catch(() => { });
    }, []);

    if (!stats) return null;

    const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n;

    return (
        <div className="bg-white py-6">
            <div className="container-app">
                <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
                    {/* Properties */}
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{formatNum(stats.approvedProperties)}</div>
                        <div className="text-sm text-gray-600 font-medium">Properties</div>
                    </div>

                    {/* Services */}
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{formatNum(stats.totalServiceProviders)}</div>
                        <div className="text-sm text-gray-600 font-medium">Service Providers</div>
                    </div>

                    {/* Users */}
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{formatNum(stats.totalUsers)}</div>
                        <div className="text-sm text-gray-600 font-medium">Total Users</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

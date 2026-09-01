"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { SafeImage } from "@/components/ui/SafeImage";
import LiteYouTube from "@/components/ui/LiteYouTube";
import { advertisementsApi, propertiesApi } from "@/services/api";

import { Link } from "@/i18n/navigation";
interface Advertisement {
    _id: string;
    title: string;
    description: string;
    imageUrl?: string;
    linkUrl?: string;
    placement: string;
}

interface PlatformStats {
    totalProperties: number;
    totalServices: number;
    totalBuySell: number;
}

const FINDAFRIQ_INTRO_VIDEO_ID = 'W7e_E5S_YKA';

export default function AdvertisementBanner() {
    const t = useTranslations("advertBanner");
    const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PlatformStats>({
        totalProperties: 0,
        totalServices: 0,
        totalBuySell: 0,
    });

    useEffect(() => {
        fetchAdvertisements();
        fetchStats();
    }, []);

    useEffect(() => {
        if (advertisements.length > 1) {
            const interval = setInterval(() => {
                setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
            }, 10000); // Change ad every 10 seconds

            return () => clearInterval(interval);
        }
    }, [advertisements.length]);

    const fetchAdvertisements = async () => {
        try {
            setLoading(true);
            const response = await advertisementsApi.getActive('home');

            // Handle response data structure
            const adsData = response.data || response;

            if (adsData && Array.isArray(adsData) && adsData.length > 0) {
                setAdvertisements(adsData);

                // Track impression for first ad
                if (adsData[0]._id) {
                    advertisementsApi.trackImpression(adsData[0]._id).catch(() => { });
                }
            }
        } catch (error) {
            console.error('Failed to fetch advertisements:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const [statsResponse, buySellResponse] = await Promise.allSettled([
                propertiesApi.getStats(),
                fetch(`${API_URL}/buy-sell?page=1&limit=1&status=approved`).then(r => r.json()).catch(() => null),
            ]);

            const statsData = statsResponse.status === 'fulfilled' ? statsResponse.value.data : null;
            const buySellData = buySellResponse.status === 'fulfilled' ? buySellResponse.value : null;
            const buySellTotal =
                buySellData?.pagination?.totalItems ??
                buySellData?.data?.pagination?.totalItems ?? 0;

            setStats({
                totalProperties: statsData ? (statsData.approvedProperties || statsData.totalProperties || 0) : 0,
                totalServices: statsData
                    ? (statsData.totalServices ?? statsData.totalServiceProviders ?? 0)
                    : 0,
                totalBuySell: Number(buySellTotal) || 0,
            });
        } catch (error) {
            console.error('Failed to fetch platform stats:', error);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K+';
        }
        return num.toString();
    };

    const handleAdClick = (ad: Advertisement) => {
        if (ad._id) {
            advertisementsApi.trackClick(ad._id).catch(() => { });
        }
        if (ad.linkUrl) {
            window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleAdChange = (index: number) => {
        setCurrentAdIndex(index);
        const ad = advertisements[index];
        if (ad._id) {
            advertisementsApi.trackImpression(ad._id).catch(() => { });
        }
    };

    // Show default banner if no ads or loading
    if (loading || advertisements.length === 0) {
        return (
            <>
                <div className="w-full bg-blue-500">
                    <div className="container-app py-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            {/* Left Content */}
                            <div className="text-white space-y-6">
                                <h2 className="text-3xl md:text-4xl font-bold">
                                    {t("heading")}
                                </h2>
                                <p className="text-lg text-white/95">
                                    {t("body")}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link
                                        href="/routes/login"
                                        className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                                    >
                                        {t("getStarted")}
                                    </Link>
                                    <Link
                                        href="/routes/how-it-works"
                                        className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
                                    >
                                        {t("howItWorks")}
                                    </Link>
                                </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-8 pt-8 border-t border-white/20">
                                <div>
                                    <div className="text-3xl font-extrabold">{formatNumber(stats.totalProperties)}</div>
                                    <div className="text-sm text-white/90">{t("propertiesListed")}</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-extrabold">{formatNumber(stats.totalServices)}</div>
                                    <div className="text-sm text-white/90">{t("servicesListed")}</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-extrabold">{formatNumber(stats.totalBuySell)}</div>
                                    <div className="text-sm text-white/90">{t("buySellListed")}</div>
                                </div>
                            </div>
                        </div>

                        {/* Introduction video */}
                        <div className="flex flex-col gap-2 w-full">
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black ring-2 ring-white/20">
                                <LiteYouTube
                                    videoId={FINDAFRIQ_INTRO_VIDEO_ID}
                                    title={t("introVideoTitle")}
                                    playLabel={t("playVideo")}
                                />
                            </div>
                            <p className="text-xs text-white/85 text-center sm:text-right">
                                Watch our introduction — FindAfriq on{' '}
                                <a
                                    href="https://www.youtube.com/@Findafriq"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline font-medium hover:text-white"
                                >
                                    YouTube
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                </div>
            </>
        );
    }

    const currentAd = advertisements[currentAdIndex];

    return (
        <div className="w-full bg-blue-500">
            <div className="container-app py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Left Content */}
                    <div className="text-white space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            {currentAd.title}
                        </h2>
                        <p className="text-lg text-white/95">
                            {currentAd.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            {currentAd.linkUrl && (
                                <button
                                    onClick={() => handleAdClick(currentAd)}
                                    className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                                >
                                    Learn More
                                </button>
                            )}
                        </div>

                        {/* Ad Navigation Dots */}
                        {advertisements.length > 1 && (
                            <div className="flex gap-2 pt-4">
                                {advertisements.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAdChange(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentAdIndex
                                            ? 'bg-white w-8'
                                            : 'bg-white/50 hover:bg-white/75'
                                            }`}
                                        aria-label={`View ad ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Image/Graphic */}
                    <div
                        className={`relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl ${currentAd.linkUrl ? 'cursor-pointer' : ''}`}
                        onClick={() => currentAd.linkUrl && handleAdClick(currentAd)}
                    >
                        <SafeImage
                            src={currentAd.imageUrl || "/images/properties/pexels-photo-323780.jpeg"}
                            alt={currentAd.title}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";
import { useState, useEffect } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { advertisementsApi, propertiesApi } from "@/services/api";
import AdvertiseModal from "@/components/modals/AdvertiseModal";

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
    totalServiceProviders: number;
    totalUsers: number;
}

export default function AdvertisementBanner() {
    const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAdvertiseModal, setShowAdvertiseModal] = useState(false);
    const [stats, setStats] = useState<PlatformStats>({
        totalProperties: 0,
        totalServiceProviders: 0,
        totalUsers: 0,
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
            const response = await propertiesApi.getStats();
            if (response.data) {
                setStats({
                    totalProperties: response.data.approvedProperties || response.data.totalProperties || 0,
                    totalServiceProviders: response.data.totalServiceProviders || 0,
                    totalUsers: response.data.totalUsers || 0,
                });
            }
        } catch (error) {
            console.error('Failed to fetch platform stats:', error);
            // Keep default fallback values if fetch fails
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
            <div className="w-full bg-blue-500">
                <div className="container-app py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* Left Content */}
                        <div className="text-white space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold">
                                Advertise with Finndex Africa
                            </h2>
                            <p className="text-lg text-white/95">
                                Reach thousands of potential customers across Africa.
                                Showcase your properties and services to a targeted audience
                                looking for trusted providers.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={() => setShowAdvertiseModal(true)}
                                    className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                                >
                                    Get Started
                                </button>
                                <a
                                    href="/routes/about"
                                    className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
                                >
                                    Learn More
                                </a>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
                                <div>
                                    <div className="text-3xl font-bold">{formatNumber(stats.totalProperties)}</div>
                                    <div className="text-sm text-white/90">Properties Listed</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">{formatNumber(stats.totalServiceProviders)}</div>
                                    <div className="text-sm text-white/90">Service Providers</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">{formatNumber(stats.totalUsers)}</div>
                                    <div className="text-sm text-white/90">Total Users</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Image/Graphic */}
                        <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
                            <SafeImage
                                src="/images/properties/pexels-photo-323780.jpeg"
                                alt="Advertise with us"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <p className="text-lg font-semibold">Join our growing network of successful partners</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advertise Modal */}
                <AdvertiseModal open={showAdvertiseModal} onClose={() => setShowAdvertiseModal(false)} />
            </div>
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

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { authService } from "@/services/api";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Verification token is missing. Please check your email link.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await authService.verifyEmail(token);
                setStatus('success');
                setMessage(response.data?.message || 'Email verified successfully! You can now log in.');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/routes/login');
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error?.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-24 h-24">
                        <Image
                            src="/images/logos/logo1.png"
                            alt="Finndex Africa"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {status === 'loading' && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h2>
                        <p className="text-gray-600">Please wait while we verify your email address.</p>
                    </div>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-amber-800">Your email is confirmed. An admin will review and verify your account shortly.</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800">Redirecting you to login in 3 seconds...</p>
                        </div>
                        <button
                            onClick={() => router.push('/routes/login')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Go to Login Now
                        </button>
                    </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/routes/login')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Go to Login
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Go to Homepage
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

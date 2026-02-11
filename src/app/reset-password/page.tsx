'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { AuthService } from '@/services/auth.service';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
            return;
        }

        setLoading(true);

        try {
            const authService = AuthService.getInstance();
            await authService.resetPassword(token, newPassword);
            setSuccess(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    Invalid reset link. Please request a new password reset.
                </div>
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                    Request New Reset Link
                </Link>
            </div>
        );
    }

    return (
        <>
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {success ? (
                <div className="text-center">
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        Your password has been reset successfully. You can now log in with your new password.
                    </div>
                    <Link
                        href="/routes/login"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700"
                    >
                        Go to Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Enter new password"
                                minLength={8}
                            />
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-3 pl-12 pr-12 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${confirmPassword && newPassword !== confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                placeholder="Confirm new password"
                                minLength={8}
                            />
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                        )}
                        {confirmPassword && newPassword === confirmPassword && (
                            <p className="mt-1 text-xs text-green-600">Passwords match</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <div className="text-center">
                        <Link
                            href="/routes/login"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                        <p className="mt-2 text-gray-600">Enter your new password below.</p>
                    </div>
                    <Suspense
                        fallback={
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        }
                    >
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

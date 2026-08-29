'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { trackPasswordResetRequested } from '@/lib/analytics';

export default function ForgotPasswordPage() {
    const t = useTranslations('forgotPassword');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const authService = AuthService.getInstance();
            await authService.forgotPassword(email);
            trackPasswordResetRequested();
            setSuccess(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('sendFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{t('heading')}</h2>
                        <p className="mt-2 text-gray-600">
                            {t('subheading')}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center">
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                {t('sentNotice')}
                            </div>
                            <Link
                                href="/routes/login"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t('backToLogin')}
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('emailAddress')}
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder={t('emailPlaceholder')}
                                    />
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t('sending') : t('submit')}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/routes/login"
                                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {t('backToLogin')}
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

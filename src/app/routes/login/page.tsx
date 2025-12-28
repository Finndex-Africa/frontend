'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '@/providers';
import type { Role } from '@/providers';

type UserType = 'HomeSeeker' | 'Agent' | 'ServiceProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AuthPage() {
    const router = useRouter();
    const { setRole, role } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [userType, setUserType] = useState<UserType>('HomeSeeker');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Redirect to home if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token && role !== 'guest') {
            router.push('/');
        }
    }, [role, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login - include rememberMe in request
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, rememberMe }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // Store token using consistent storage strategy
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('token', data.data.token);
                storage.setItem('user', JSON.stringify(data.data.user));

                // Clean up legacy authToken keys from both storages
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');

                console.log('✅ Login successful - Token stored:', data.data.token.substring(0, 20) + '...');
                try {
                    // Also persist a debug entry so reloads don't lose this important info
                    const { logDebug } = await import('@/utils/persistentLogger');
                    logDebug('Login successful - token stored', { tokenPreview: data.data.token.substring(0, 20), rememberMe });
                } catch {
                    // ignore
                }

                // Map backend role to frontend role
                const roleMap: Record<string, Role> = {
                    admin: 'admin',
                    agent: 'landlord',
                    landlord: 'landlord',
                    service_provider: 'provider',
                    home_seeker: 'home_seeker',
                };
                setRole(roleMap[data.data.user.userType] || 'guest');
                console.log('✅ Role set:', roleMap[data.data.user.userType] || 'guest');

                // Redirect to discover page (home)
                console.log('🚀 Redirecting to discover page');
                window.location.href = '/';
            } else {
                // Sign up - Map userType to backend enum
                const userTypeMap: Record<UserType, string> = {
                    'HomeSeeker': 'home_seeker',
                    // Backend uses 'agent' role for property agents
                    'Agent': 'agent',
                    'ServiceProvider': 'service_provider',
                };

                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        phone,
                        firstName,
                        lastName,
                        userType: userTypeMap[userType],
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                // Show success message - email verification required
                setSuccessMessage('Registration successful! Please check your email to verify your account.');
                setLoading(false);

                // Reset form
                setEmail('');
                setPassword('');
                setPhone('');
                setFirstName('');
                setLastName('');

                // Auto-switch to login form after 3 seconds
                setTimeout(() => {
                    setIsLogin(true);
                    setSuccessMessage('');
                }, 3000);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full space-y-6"
            >
                {/* Toggle Login / Sign-Up */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-blue-900">
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {isLogin
                            ? 'Or create a new account'
                            : 'Already have an account? '}
                        {!isLogin && (
                            <button
                                onClick={() => setIsLogin(true)}
                                className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                            >
                                Sign In
                            </button>
                        )}
                        {isLogin && (
                            <button
                                onClick={() => setIsLogin(false)}
                                className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                            >
                                Sign Up
                            </button>
                        )}
                    </p>
                </div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-lg shadow-lg p-8"
                >
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            {successMessage}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User Type
                                </label>
                                <select
                                    value={userType}
                                    onChange={(e) => setUserType(e.target.value as UserType)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="HomeSeeker">Home Seeker</option>
                                    <option value="Agent">Agent</option>
                                    <option value="ServiceProvider">Service Provider</option>
                                </select>
                            </div>
                        )}

                        {/* First Name & Last Name (only for sign-up) */}
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="First name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your email"
                                />
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Phone (only for sign-up) */}
                        {!isLogin && (
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="+250788123456"
                                    />
                                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Enter phone in international format (e.g., +250788123456)</p>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your password"
                                />
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        {isLogin && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember Me
                                    </label>
                                </div>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        )}

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
}

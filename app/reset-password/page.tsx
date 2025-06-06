'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
    // const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
        }
    }, [token]);

    const validatePassword = () => {
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validatePassword()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9] flex items-center justify-center px-4">
                <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-[#c1a5a2]/20 p-8 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-[#9a6a63] mb-4">
                        Password Reset Successfully!
                    </h1>

                    <p className="text-[#9a6a63]/70 mb-8 leading-relaxed">
                        Your password has been updated. You can now sign in with your new password.
                    </p>

                    <Link
                        href="/login"
                        className="inline-block w-full py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg text-center"
                        style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    >
                        Continue to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9] flex items-center justify-center px-4">
            <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-[#c1a5a2]/20 p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#9a6a63]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-[#9a6a63]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#9a6a63] mb-2">
                        Reset Password
                    </h1>
                    <p className="text-[#9a6a63]/70">
                        Enter your new password below
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                className="w-full px-4 py-3 pr-12 border border-[#c1a5a2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a6a63]/20 focus:border-[#9a6a63] bg-white text-neutral-700 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9a6a63]/60 hover:text-[#9a6a63] transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-[#9a6a63]/50 mt-2">
                            Must be at least 6 characters long
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                className="w-full px-4 py-3 pr-12 border border-[#c1a5a2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a6a63]/20 focus:border-[#9a6a63] bg-white text-neutral-700 transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9a6a63]/60 hover:text-[#9a6a63] transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                                <div className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span className={password.length >= 6 ? 'text-green-600' : 'text-gray-500'}>
                                    At least 6 characters
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className={`w-2 h-2 rounded-full ${password === confirmPassword && password ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span className={password === confirmPassword && password ? 'text-green-600' : 'text-gray-500'}>
                                    Passwords match
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !token || !password || !confirmPassword}
                        className="w-full py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Updating Password...
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                Update Password
                            </>
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="text-sm text-[#9a6a63] hover:text-[#9a6a63]/80 transition-colors font-medium"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
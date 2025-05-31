'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSent(true);
            } else {
                setError(data.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9] flex items-center justify-center px-4">
                <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-[#c1a5a2]/20 p-8 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-[#9a6a63] mb-4">
                        Check Your Email
                    </h1>

                    <p className="text-[#9a6a63]/70 mb-6 leading-relaxed">
                        We've sent a password reset link to{' '}
                        <span className="font-medium text-[#9a6a63]">{email}</span>
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                setSent(false);
                                setEmail('');
                            }}
                            className="w-full py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                        >
                            Send Another Email
                        </button>

                        <Link
                            href="/login"
                            className="block w-full py-3 border border-[#c1a5a2]/30 text-[#9a6a63] rounded-xl font-medium hover:bg-[#9a6a63]/5 transition-all text-center"
                        >
                            Back to Login
                        </Link>
                    </div>

                    <p className="text-xs text-[#9a6a63]/50 mt-6">
                        Didn't receive the email? Check your spam folder or try again.
                    </p>
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
                        <Mail className="w-8 h-8 text-[#9a6a63]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#9a6a63] mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-[#9a6a63]/70">
                        No worries! Enter your email and we'll send you a reset link.
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
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="w-full px-4 py-3 border border-[#c1a5a2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a6a63]/20 focus:border-[#9a6a63] bg-white text-neutral-700 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <p className="text-xs text-[#9a6a63]/50 mt-2">
                            We'll send a password reset link to this email.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="w-full py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending Reset Link...
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4" />
                                Send Reset Link
                            </>
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-[#9a6a63] hover:text-[#9a6a63]/80 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>

                {/* Additional Help */}
                <div className="mt-8 pt-6 border-t border-[#c1a5a2]/20">
                    <div className="text-center">
                        <p className="text-xs text-[#9a6a63]/50 mb-3">
                            Still having trouble?
                        </p>
                        <Link
                            href="/support"
                            className="text-xs text-[#9a6a63] hover:text-[#9a6a63]/80 transition-colors font-medium"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
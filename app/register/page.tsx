'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, User, Mail, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        genre: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!form.email || !form.password || !form.firstName || !form.lastName) {
            setError('All required fields must be completed.');
            setLoading(false);
            return;
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/user', {
                method: 'POST',
                body: JSON.stringify(form),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                const err = await res.json();
                setError(err.error || 'Registration error.');
            } else {
                // Success - redirect to login
                router.push('/login?message=Registration successful! Please sign in.');
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9] flex items-center justify-center px-4">
            <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-[#c1a5a2]/20 p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#9a6a63]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-[#9a6a63]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#9a6a63] mb-2">Create Account</h1>
                    <p className="text-[#9a6a63]/70">Join our community today</p>
                </div>

                {/* Google Sign Up - Prominently displayed */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="w-full border border-[#c1a5a2]/30 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-[#9a6a63]/5 transition-all font-medium text-[#9a6a63] mb-4"
                    >
                        <FcGoogle className="text-xl" />
                        Continue with Google
                        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Auto-fill
                        </span>
                    </button>
                    <p className="text-xs text-center text-[#9a6a63]/60">
                        Google will auto-fill your profile information
                    </p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <hr className="flex-1 border-[#c1a5a2]/30" />
                    <span className="text-sm text-[#9a6a63]/70">or sign up manually</span>
                    <hr className="flex-1 border-[#c1a5a2]/30" />
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                placeholder="John"
                                className="w-full px-4 py-3 border border-[#c1a5a2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a6a63]/20 focus:border-[#9a6a63] bg-white text-neutral-700 transition-all"
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                placeholder="Doe"
                                className="w-full px-4 py-3 border border-[#c1a5a2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a6a63]/20 focus:border-[#9a6a63] bg-white text-neutral-700 transition-all"
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                            Email Address *
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="john@example.com"
                                className="w-full px-4 py-3 pl-12 border border-[#c1a5a2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a6a63]/20 focus:border-[#9a6a63] bg-white text-neutral-700 transition-all"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9a6a63]/60 w-4 h-4" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                            Password *
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a strong password"
                                className="w-full px-4 py-3 pr-12 border border-[#c1a5a2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a6a63]/20 focus:border-[#9a6a63] bg-white text-neutral-700 transition-all"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

                    {/* Optional fields - collapsible */}
                    <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-[#9a6a63] mb-2 list-none flex items-center justify-between">
                            <span>Additional Information (Optional)</span>
                            <span className="text-xs text-[#9a6a63]/60 group-open:hidden">Click to expand</span>
                        </summary>

                        <div className="space-y-4 mt-4 pt-4 border-t border-[#c1a5a2]/20">
                            <div>
                                <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                    Birth Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 border border-[#c1a5a2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a6a63]/20 focus:border-[#9a6a63] bg-white text-neutral-700 transition-all"
                                    value={form.birthDate}
                                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                    Gender
                                </label>
                                <select
                                    className="w-full px-4 py-3 border border-[#c1a5a2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a6a63]/20 focus:border-[#9a6a63] bg-white text-neutral-700 transition-all"
                                    value={form.genre}
                                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>
                    </details>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-[#9a6a63]/70">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-[#9a6a63] font-medium hover:text-[#9a6a63]/80 transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
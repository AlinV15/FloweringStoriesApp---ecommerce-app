'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError('Invalid email or password.');
        } else {
            router.push('/');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9] flex items-center justify-center px-4">
            <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-[#c1a5a2]/20 p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#9a6a63] mb-2">Welcome Back</h1>
                    <p className="text-[#9a6a63]/70">Sign in to your account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-[#c1a5a2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a6a63]/20 focus:border-[#9a6a63] bg-white text-neutral-700 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 border border-[#c1a5a2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9a6a63]/20 focus:border-[#9a6a63] bg-white text-neutral-700 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="rounded border-[#c1a5a2]/30 text-[#9a6a63] focus:ring-[#9a6a63]/20"
                            />
                            <span className="ml-2 text-[#9a6a63]/70">Remember me</span>
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-[#9a6a63] hover:text-[#9a6a63]/80 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="flex items-center gap-4 my-6">
                    <hr className="flex-1 border-[#c1a5a2]/30" />
                    <span className="text-sm text-[#9a6a63]/70">or continue with</span>
                    <hr className="flex-1 border-[#c1a5a2]/30" />
                </div>

                <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="w-full border border-[#c1a5a2]/30 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-[#9a6a63]/5 transition-all font-medium text-[#9a6a63]"
                >
                    <FcGoogle className="text-xl" />
                    Continue with Google
                </button>

                <div className="text-center mt-6">
                    <p className="text-sm text-[#9a6a63]/70">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="text-[#9a6a63] font-medium hover:text-[#9a6a63]/80 transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
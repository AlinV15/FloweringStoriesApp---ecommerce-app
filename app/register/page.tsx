'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { signIn } from 'next-auth/react';

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
                router.push('/login');
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdf8f6] flex items-center justify-center px-4 text-neutral-700">
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6">
                <h1 className="text-3xl font-light text-[#9c6b63] text-center">Register</h1>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <input
                    type="text"
                    placeholder="First Name *"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Last Name *"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                />
                <input
                    type="email"
                    placeholder="Email *"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Password *"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                />
                <input
                    type="date"
                    placeholder="Birth Date"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={form.birthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                />
                <select
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#9c6b63] hover:bg-[#875a53] disabled:bg-gray-400 text-white py-3 rounded-lg transition"
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="flex items-center gap-2 my-4">
                    <hr className="flex-grow border-neutral-300" />
                    <span className="text-sm text-neutral-500">or</span>
                    <hr className="flex-grow border-neutral-300" />
                </div>

                <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="w-full border border-neutral-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-neutral-100 transition"
                >
                    <FcGoogle className="text-xl" />
                    Continue with Google
                </button>

                <p className="text-center text-sm text-neutral-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#9c6b63] font-medium hover:underline">
                        Sign In
                    </Link>
                </p>
            </form>
        </div>
    );
}
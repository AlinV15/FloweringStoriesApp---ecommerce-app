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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError('Email sau parolă incorectă.');
        } else {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#fdf8f6] flex items-center justify-center px-4 text-neutral-700">
            <form onSubmit={handleLogin} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6">
                <h1 className="text-3xl font-light text-[#9c6b63] text-center">Autentificare</h1>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Parolă"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="submit"
                    className="w-full bg-[#9c6b63] hover:bg-[#875a53] text-white py-3 rounded-lg transition"
                >
                    Intră în cont
                </button>

                <div className="flex items-center gap-2 my-4">
                    <hr className="flex-grow border-neutral-300" />
                    <span className="text-sm text-neutral-500">sau</span>
                    <hr className="flex-grow border-neutral-300" />
                </div>

                <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/' }) // sau orice pagină vrei după login
                    }
                    className="w-full border border-neutral-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-neutral-100 transition"
                >
                    <FcGoogle className="text-xl" />
                    Continuă cu Google
                </button>

                <p className="text-center text-sm text-neutral-500">
                    Nu ai cont?{' '}
                    <Link href="/register" className="text-[#9c6b63] font-medium hover:underline">
                        Înregistrează-te
                    </Link>
                </p>
            </form>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/user', {
            method: 'POST',
            body: JSON.stringify(form),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            const err = await res.json();
            setError(err.error || 'Eroare la înregistrare.');
        } else {
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#fdf8f6] flex items-center justify-center px-4">
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6">
                <h1 className="text-3xl font-light text-[#9c6b63] text-center">Înregistrare</h1>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <input
                    type="text"
                    placeholder="Prenume"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Nume"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Parolă"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd]"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />

                <button
                    type="submit"
                    className="w-full bg-[#9c6b63] hover:bg-[#875a53] text-white py-3 rounded-lg transition"
                >
                    Creează contul
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
                    Ai deja cont?{' '}
                    <Link href="/login" className="text-[#9c6b63] font-medium hover:underline">
                        Autentifică-te
                    </Link>
                </p>
            </form>
        </div>
    );
}

// app/components/ClientHomepage.tsx - Client-side interactivity
'use client';

import { useState } from 'react';

interface ClientHomepageProps {
    primaryColor: string;
    secondaryColor: string;
}

export default function ClientHomepage({ primaryColor, secondaryColor }: ClientHomepageProps) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setMessage('Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Thank you for subscribing to our newsletter!');
                setEmail('');
            } else {
                setMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    disabled={isSubmitting}
                    className="placeholder-neutral-400 flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 bg-white disabled:opacity-50"
                    style={{ '--tw-ring-color': secondaryColor } as React.CSSProperties}
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 font-medium rounded-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        backgroundColor: secondaryColor,
                        color: primaryColor
                    }}
                >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
            </form>

            {message && (
                <p className={`mt-4 text-sm ${message.includes('Thank you') ? 'text-green-200' : 'text-red-200'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
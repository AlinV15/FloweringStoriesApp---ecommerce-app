'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useCartStore } from '@/app/stores/CartStore';
import {
    ArrowLeft,
    CreditCard,
    Truck,
    MapPin,
    User,
    Lock,
    CheckCircle,
} from 'lucide-react';

// Type definitions
interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    newsletter: boolean;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        details: string;
    } | null;
}

interface OrderFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    details: string;
    deliveryMethod: 'courier' | 'pickup';
    paymentMethod: 'card';
    note: string;
    createAccount: boolean;
    newsletter: boolean;
}

interface FormErrors {
    [key: string]: string;
}

// Custom hook for fetching user checkout data
const useUserCheckoutData = () => {
    const { data: session } = useSession();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user?.id) {
            fetchUserData();
        }
    }, [session]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/user/checkout-data');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setUserData(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    return { userData, loading };
};

export default function CheckoutPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { items, getTotalPrice } = useCartStore();
    const { userData, loading: userDataLoading } = useUserCheckoutData();

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // Initialize form data
    const [formData, setFormData] = useState<OrderFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Romania',
        details: '',
        deliveryMethod: 'courier',
        paymentMethod: 'card',
        note: '',
        createAccount: false,
        newsletter: false
    });

    // Update form data when user data is loaded
    useEffect(() => {
        if (userData) {
            setFormData(prevData => ({
                ...prevData,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                newsletter: userData.newsletter || false,
                // If user has a saved address, populate it
                ...(userData.address && {
                    street: userData.address.street || '',
                    city: userData.address.city || '',
                    state: userData.address.state || '',
                    postalCode: userData.address.postalCode || '',
                    country: userData.address.country || 'Romania',
                    details: userData.address.details || ''
                })
            }));
        }
    }, [userData]);

    const subtotal = getTotalPrice();
    const shipping = formData.deliveryMethod === 'pickup' ? 0 : (subtotal > 100 ? 0 : 15);
    const total = subtotal + shipping;

    // Redirect if cart is empty
    if (items.length === 0) {
        router.push('/cart');
        return null;
    }

    // Show loading state while fetching user data
    if (userDataLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
                <Header />
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-[#9a6a63] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[#9a6a63]/70">Loading your information...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Required fields
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Address validation (only for courier delivery)
        if (formData.deliveryMethod === 'courier') {
            if (!formData.street.trim()) newErrors.street = 'Street address is required';
            if (!formData.city.trim()) newErrors.city = 'City is required';
            if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Create order data
            const orderData = {
                items: items.map((item: any) => ({
                    product: item.id,
                    quantity: item.quantity,
                    lineAmount: (item.discount > 0
                        ? item.price * (1 - item.discount / 100)
                        : item.price) * item.quantity
                })),
                customer: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    newsletter: formData.newsletter
                },
                address: formData.deliveryMethod === 'courier' ? {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country,
                    details: formData.details
                } : null,
                deliveryMethod: formData.deliveryMethod,
                paymentMethod: formData.paymentMethod,
                note: formData.note,
                totalAmount: total,
                userId: session?.user?.id || null
            };

            // Create order in database
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const { order } = await response.json();

            // Create Stripe checkout session
            const paymentResponse = await fetch('/api/payments/create-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: order._id,
                    lineItems: items.map((item: any) => ({
                        name: item.name,
                        unitAmount: item.discount > 0
                            ? item.price * (1 - item.discount / 100)
                            : item.price,
                        quantity: item.quantity
                    }))
                }),
            });

            if (!paymentResponse.ok) {
                throw new Error('Failed to create payment session');
            }

            const { url } = await paymentResponse.json();

            // Redirect to Stripe Checkout
            window.location.href = url;

        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
            <Header />
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-[#9a6a63] hover:text-[#9a6a63]/80 transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm">Back to Cart</span>
                    </Link>
                    <h1 className="text-4xl font-bold text-[#9a6a63] mb-2">Checkout</h1>
                    <p className="text-[#9a6a63]/70">Complete your order</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Customer Information */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#9a6a63]/10 rounded-lg">
                                    <User className="text-[#9a6a63]" size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-[#9a6a63]">Customer Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.firstName ? 'border-red-300' : 'border-[#c1a5a2]/30'} focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700`}
                                        placeholder="Enter your first name"
                                    />
                                    {errors.firstName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.lastName ? 'border-red-300' : 'border-[#c1a5a2]/30'} focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700`}
                                        placeholder="Enter your last name"
                                    />
                                    {errors.lastName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300' : 'border-[#c1a5a2]/30'} focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700`}
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-300' : 'border-[#c1a5a2]/30'} focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700`}
                                        placeholder="Enter your phone number"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Delivery Method */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#9a6a63]/10 rounded-lg">
                                    <Truck className="text-[#9a6a63]" size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-[#9a6a63]">Delivery Method</h2>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-4 p-4 border border-[#c1a5a2]/30 rounded-xl cursor-pointer hover:bg-[#9a6a63]/5 transition">
                                    <input
                                        type="radio"
                                        name="deliveryMethod"
                                        value="courier"
                                        checked={formData.deliveryMethod === 'courier'}
                                        onChange={handleInputChange}
                                        className="text-[#9a6a63] focus:ring-[#9a6a63]"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-[#9a6a63]">Delivery by Courier</div>
                                        <div className="text-sm text-[#9a6a63]/70">
                                            {subtotal > 100 ? 'Free delivery' : '€15.00 delivery fee'}
                                        </div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-4 p-4 border border-[#c1a5a2]/30 rounded-xl cursor-pointer hover:bg-[#9a6a63]/5 transition">
                                    <input
                                        type="radio"
                                        name="deliveryMethod"
                                        value="pickup"
                                        checked={formData.deliveryMethod === 'pickup'}
                                        onChange={handleInputChange}
                                        className="text-[#9a6a63] focus:ring-[#9a6a63]"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-[#9a6a63]">Store Pickup</div>
                                        <div className="text-sm text-[#9a6a63]/70">Free - Pick up from our store</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Delivery Address - Only show if courier delivery */}
                        {formData.deliveryMethod === 'courier' && (
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-[#9a6a63]/10 rounded-lg">
                                        <MapPin className="text-[#9a6a63]" size={20} />
                                    </div>
                                    <h2 className="text-xl font-semibold text-[#9a6a63]">Delivery Address</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.street ? 'border-red-300' : 'border-[#c1a5a2]/30'} focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700`}
                                            placeholder="Enter your street address"
                                        />
                                        {errors.street && (
                                            <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.city ? 'border-red-300' : 'border-[#c1a5a2]/30'} focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700`}
                                                placeholder="Enter your city"
                                            />
                                            {errors.city && (
                                                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                                State/County
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                                placeholder="Enter your state/county"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                                Postal Code *
                                            </label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.postalCode ? 'border-red-300' : 'border-[#c1a5a2]/30'} focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700`}
                                                placeholder="Enter postal code"
                                            />
                                            {errors.postalCode && (
                                                <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                                Country
                                            </label>
                                            <select
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                            >
                                                <option value="Romania">Romania</option>
                                                <option value="Germany">Germany</option>
                                                <option value="France">France</option>
                                                <option value="Italy">Italy</option>
                                                <option value="Spain">Spain</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                            Additional Details
                                        </label>
                                        <input
                                            type="text"
                                            name="details"
                                            value={formData.details}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                            placeholder="Apartment, suite, unit, building, floor, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#9a6a63]/10 rounded-lg">
                                    <CreditCard className="text-[#9a6a63]" size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-[#9a6a63]">Payment Method</h2>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-4 p-4 border border-[#c1a5a2]/30 rounded-xl cursor-pointer hover:bg-[#9a6a63]/5 transition">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={formData.paymentMethod === 'card'}
                                        onChange={handleInputChange}
                                        className="text-[#9a6a63] focus:ring-[#9a6a63]"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-[#9a6a63] flex items-center gap-2">
                                            <Lock size={16} />
                                            Credit/Debit Card
                                        </div>
                                        <div className="text-sm text-[#9a6a63]/70">
                                            Secure payment with Stripe
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Order Notes */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-4">Order Notes (Optional)</h3>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700 resize-none"
                                placeholder="Add any special instructions for your order..."
                            />
                        </div>

                        {/* Guest Options */}
                        {!session && (
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-4">Account Options</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="createAccount"
                                            checked={formData.createAccount}
                                            onChange={handleInputChange}
                                            className="text-[#9a6a63] focus:ring-[#9a6a63] rounded"
                                        />
                                        <span className="text-sm text-[#9a6a63]">
                                            Create an account for faster checkout next time
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="newsletter"
                                            checked={formData.newsletter}
                                            onChange={handleInputChange}
                                            className="text-[#9a6a63] focus:ring-[#9a6a63] rounded"
                                        />
                                        <span className="text-sm text-[#9a6a63]">
                                            Subscribe to our newsletter for updates and special offers
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6 sticky top-4">
                            <h3 className="font-semibold text-[#9a6a63] mb-6">Order Summary</h3>

                            {/* Items */}
                            <div className="space-y-4 mb-6">
                                {items.map((item: any) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover rounded-lg"
                                            />
                                            <div className="absolute -top-2 -right-2 bg-[#9a6a63] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-[#9a6a63] truncate">
                                                {item.name}
                                            </h4>
                                            <p className="text-xs text-[#9a6a63]/70 capitalize">{item.type}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm font-semibold text-[#9a6a63]">
                                                    €{((item.discount > 0
                                                        ? item.price * (1 - item.discount / 100)
                                                        : item.price
                                                    ) * item.quantity).toFixed(2)}
                                                </span>
                                                {item.discount > 0 && (
                                                    <span className="text-xs text-gray-500 line-through">
                                                        €{(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-[#c1a5a2]/30 mb-4" />

                            {/* Totals */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[#9a6a63]/70">Subtotal</span>
                                    <span className="font-medium text-[#9a6a63]">€{subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-[#9a6a63]/70">Shipping</span>
                                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-[#9a6a63]'}`}>
                                        {shipping === 0 ? 'FREE' : `€${shipping.toFixed(2)}`}
                                    </span>
                                </div>

                                <hr className="border-[#c1a5a2]/30" />

                                <div className="flex justify-between text-lg font-semibold">
                                    <span className="text-[#9a6a63]">Total</span>
                                    <span className="text-[#9a6a63]">€{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full mt-6 flex items-center justify-center gap-3 px-6 py-4 text-white rounded-xl transition-all font-medium ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'transform hover:scale-105 shadow-lg'
                                    }`}
                                style={!loading ? { background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' } : {}}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={20} />
                                        Complete Order
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Security Info */}
                        <div className="bg-green-50/80 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle className="text-green-600" size={20} />
                                <h4 className="font-medium text-green-800">Secure & Safe</h4>
                            </div>
                            <p className="text-sm text-green-700">
                                Your payment is processed securely through Stripe. We never store your card details.
                            </p>
                        </div>
                    </div>
                </form>
            </main>
            <Footer />
        </div>
    );
}
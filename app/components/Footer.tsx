'use client';

import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useShopSettings } from "@/contexts/ShopSettingsContext";
import { FeatureGuard } from "./FeatureGuard";
import { useState } from "react";

export default function Footer() {
    const { settings } = useShopSettings();
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    // Get data from settings with fallbacks
    const logoSrc = settings?.logo?.footerLogo || settings?.logo?.headerLogo || "/flowering_stories_logo.png";
    const shopName = settings?.shopName || "Flowering Stories";
    const description = settings?.description || "We cultivate stories that bloom in readers' hearts. Our bookstore offers a curated collection of books, stationery items, and floral arrangements that transform every moment into an unforgettable story.";
    const primaryColor = settings?.colors?.primary || "#9c6b63";
    const secondaryColor = settings?.colors?.secondary || "#f5e1dd";
    const accentColor = settings?.colors?.accent || "#f0d1cc";

    // Contact info from settings
    const contactEmail = settings?.contact?.email || "contact@floweringstories.ro";
    const contactPhone = settings?.contact?.phone || "+40 712 345 678";
    const address = settings?.contact?.address;

    // Social media links
    const socialMedia = settings?.socialMedia || {};

    // Handle newsletter subscription
    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsSubscribing(true);
        try {
            // Here you would typically call your newsletter API
            console.log('Subscribing email:', email);
            // Reset form on success
            setEmail('');
            // You might want to show a success message here
        } catch (error) {
            console.error('Newsletter subscription error:', error);
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <footer className="bg-[#fdf8f6] border-t border-[#f0e4e0] text-neutral-500">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Image
                                src={logoSrc}
                                alt={shopName}
                                width={40}
                                height={40}
                                className="rounded-full shadow-sm"
                            />
                            <span className="text-lg font-light tracking-wide">
                                <span className="font-semibold">{shopName.split(' ')[0]}</span> {shopName.split(' ').slice(1).join(' ')}
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3
                            className="font-medium text-lg"
                            style={{ color: primaryColor }}
                        >
                            Quick Links
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/about"
                                    className="transition flex items-center gap-1"
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                                >
                                    <span
                                        className="h-1 w-1 rounded-full inline-block"
                                        style={{ backgroundColor: primaryColor }}
                                    ></span>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/products"
                                    className="transition flex items-center gap-1"
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                                >
                                    <span
                                        className="h-1 w-1 rounded-full inline-block"
                                        style={{ backgroundColor: primaryColor }}
                                    ></span>
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="transition flex items-center gap-1"
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                                >
                                    <span
                                        className="h-1 w-1 rounded-full inline-block"
                                        style={{ backgroundColor: primaryColor }}
                                    ></span>
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/events"
                                    className="transition flex items-center gap-1"
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                                >
                                    <span
                                        className="h-1 w-1 rounded-full inline-block"
                                        style={{ backgroundColor: primaryColor }}
                                    ></span>
                                    Events
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="transition flex items-center gap-1"
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                                >
                                    <span
                                        className="h-1 w-1 rounded-full inline-block"
                                        style={{ backgroundColor: primaryColor }}
                                    ></span>
                                    Frequently Asked Questions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3
                            className="font-medium text-lg"
                            style={{ color: primaryColor }}
                        >
                            Contact
                        </h3>
                        <ul className="space-y-3 text-sm">
                            {address && (
                                <li className="flex items-start gap-2">
                                    <MapPin
                                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                                        style={{ color: primaryColor }}
                                    />
                                    <span>
                                        {address.street && `${address.street}, `}
                                        {address.city && `${address.city}, `}
                                        {address.state && `${address.state}, `}
                                        {address.postalCode && `${address.postalCode}, `}
                                        {address.country}
                                    </span>
                                </li>
                            )}
                            {!address && (
                                <li className="flex items-start gap-2">
                                    <MapPin
                                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                                        style={{ color: primaryColor }}
                                    />
                                    <span>42 Florilor Street, Bucharest, Romania</span>
                                </li>
                            )}

                            {contactPhone && (
                                <li className="flex items-center gap-2">
                                    <Phone
                                        className="w-4 h-4 flex-shrink-0"
                                        style={{ color: primaryColor }}
                                    />
                                    <a
                                        href={`tel:${contactPhone}`}
                                        className="transition"
                                        onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                        onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                                    >
                                        {contactPhone}
                                    </a>
                                </li>
                            )}

                            {contactEmail && (
                                <li className="flex items-center gap-2">
                                    <Mail
                                        className="w-4 h-4 flex-shrink-0"
                                        style={{ color: primaryColor }}
                                    />
                                    <a
                                        href={`mailto:${contactEmail}`}
                                        className="transition"
                                        onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                        onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                                    >
                                        {contactEmail}
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <FeatureGuard feature="enableNewsletter">
                        <div className="space-y-4">
                            <h3
                                className="font-medium text-lg"
                                style={{ color: primaryColor }}
                            >
                                Subscribe
                            </h3>
                            <p className="text-sm">Receive updates about book releases and special offers.</p>
                            <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-2">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="px-4 py-2 border border-[#f0e4e0] rounded-lg focus:outline-none focus:ring-2 bg-white transition"
                                    style={{
                                        '--tw-ring-color': primaryColor
                                    } as React.CSSProperties}
                                    onFocus={(e) => (e.target as HTMLElement).style.borderColor = primaryColor}
                                    onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#f0e4e0'}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSubscribing}
                                    className="px-4 py-2 text-white rounded-lg transition text-sm disabled:opacity-50"
                                    style={{ backgroundColor: primaryColor }}
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                                >
                                    {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                                </button>
                            </form>
                        </div>
                    </FeatureGuard>
                </div>

                {/* Social Media & Lower Footer */}
                <div className="mt-10 pt-6 border-t border-[#f0e4e0]">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="text-xs text-center md:text-left">
                                &copy; {new Date().getFullYear()} {shopName}. All rights reserved.
                            </p>
                        </div>

                        <div className="flex space-x-4">
                            {socialMedia.facebook && (
                                <a
                                    href={socialMedia.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full transition"
                                    style={{
                                        backgroundColor: secondaryColor,
                                        color: primaryColor
                                    }}
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = accentColor}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = secondaryColor}
                                >
                                    <FaFacebookF className="w-4 h-4" />
                                </a>
                            )}

                            {socialMedia.instagram && (
                                <a
                                    href={socialMedia.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full transition"
                                    style={{
                                        backgroundColor: secondaryColor,
                                        color: primaryColor
                                    }}
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = accentColor}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = secondaryColor}
                                >
                                    <FaInstagram className="w-4 h-4" />
                                </a>
                            )}

                            {socialMedia.twitter && (
                                <a
                                    href={socialMedia.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full transition"
                                    style={{
                                        backgroundColor: secondaryColor,
                                        color: primaryColor
                                    }}
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = accentColor}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = secondaryColor}
                                >
                                    <FaXTwitter className="w-4 h-4" />
                                </a>
                            )}

                            {socialMedia.tiktok && (
                                <a
                                    href={socialMedia.tiktok}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full transition"
                                    style={{
                                        backgroundColor: secondaryColor,
                                        color: primaryColor
                                    }}
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = accentColor}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = secondaryColor}
                                >
                                    <FaTiktok className="w-4 h-4" />
                                </a>
                            )}

                            {/* Fallback social icons if no social media is configured */}
                            {!socialMedia.facebook && !socialMedia.instagram && !socialMedia.twitter && !socialMedia.tiktok && (
                                <>
                                    <a
                                        href="https://facebook.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full transition"
                                        style={{
                                            backgroundColor: secondaryColor,
                                            color: primaryColor
                                        }}
                                        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = accentColor}
                                        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = secondaryColor}
                                    >
                                        <FaFacebookF className="w-4 h-4" />
                                    </a>
                                    <a
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full transition"
                                        style={{
                                            backgroundColor: secondaryColor,
                                            color: primaryColor
                                        }}
                                        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = accentColor}
                                        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = secondaryColor}
                                    >
                                        <FaInstagram className="w-4 h-4" />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Finishing Touch - Decorative Bottom Border */}
            <div
                className="h-2 bg-gradient-to-r"
                style={{
                    backgroundImage: `linear-gradient(to right, ${secondaryColor}, ${primaryColor}, ${secondaryColor})`
                }}
            ></div>
        </footer>
    );
}
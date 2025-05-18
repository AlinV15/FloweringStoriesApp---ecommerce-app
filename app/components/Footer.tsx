'use client';

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
    return (
        <footer className="bg-[#fdf8f6] border-t border-[#f0e4e0] text-neutral-500">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Image
                                src="/flowering_stories_logo.png"
                                alt="Flowering Stories"
                                width={40}
                                height={40}
                                className="rounded-full shadow-sm"
                            />
                            <span className="text-lg font-light tracking-wide">
                                <span className="font-semibold">Flowering</span> Stories
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            We cultivate stories that bloom in readers' hearts. Our bookstore offers
                            a curated collection of books, stationery items, and floral arrangements that
                            transform every moment into an unforgettable story.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-[#9c6b63] font-medium text-lg">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="hover:text-pink-600 transition flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-pink-400 inline-block"></span>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="hover:text-pink-600 transition flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-pink-400 inline-block"></span>
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-pink-600 transition flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-pink-400 inline-block"></span>
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/events" className="hover:text-pink-600 transition flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-pink-400 inline-block"></span>
                                    Events
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-pink-600 transition flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-pink-400 inline-block"></span>
                                    Frequently Asked Questions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-[#9c6b63] font-medium text-lg">Contact</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-pink-500" />
                                <span>42 Florilor Street, Bucharest, Romania</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 flex-shrink-0 text-pink-500" />
                                <span>+40 712 345 678</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 flex-shrink-0 text-pink-500" />
                                <a href="mailto:contact@floweringstories.ro" className="hover:text-pink-600 transition">
                                    contact@floweringstories.ro
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-4">
                        <h3 className="text-[#9c6b63] font-medium text-lg">Subscribe</h3>
                        <p className="text-sm">Receive updates about book releases and special offers.</p>
                        <div className="flex flex-col space-y-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="px-4 py-2 border border-[#f0e4e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                            />
                            <button className="px-4 py-2 bg-[#9c6b63] hover:bg-[#875a53] text-white rounded-lg transition text-sm">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Social Media & Lower Footer */}
                <div className="mt-10 pt-6 border-t border-[#f0e4e0]">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="text-xs text-center md:text-left">
                                &copy; {new Date().getFullYear()} Flowering Stories. All rights reserved.
                            </p>
                        </div>

                        <div className="flex space-x-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-[#f5e1dd] hover:bg-[#f0d1cc] text-[#9c6b63] rounded-full transition"
                            >
                                <FaFacebookF className="w-4 h-4" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-[#f5e1dd] hover:bg-[#f0d1cc] text-[#9c6b63] rounded-full transition"
                            >
                                <FaInstagram className="w-4 h-4" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-[#f5e1dd] hover:bg-[#f0d1cc] text-[#9c6b63] rounded-full transition"
                            >
                                <FaXTwitter className="w-4 h-4" />
                            </a>

                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-[#f5e1dd] hover:bg-[#f0d1cc] text-[#9c6b63] rounded-full transition">
                                <FaTiktok className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Finishing Touch - Decorative Bottom Border */}
            <div className="h-2 bg-gradient-to-r from-[#f5e1dd] via-[#9c6b63] to-[#f5e1dd]"></div>
        </footer>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Info, Edit3, Send, Star, LogIn } from 'lucide-react';

interface ProductTabsProps {
    product: {
        _id: string;
        name: string;
        reviews: any[];
    };
    productDetails: React.ReactNode;
    reviewSection: React.ReactNode;
}

export default function ProductTabs({ product, productDetails, reviewSection }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState('details');
    const { data: session } = useSession();
    const router = useRouter();

    // Review form state
    const [reviewForm, setReviewForm] = useState({
        rating: 0,
        comment: ''
    });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState(false);

    // Check if user has already reviewed this product
    const [hasUserReviewed, setHasUserReviewed] = useState(false);

    useEffect(() => {
        if (session?.user?.email && product.reviews) {
            // Check if current user has already reviewed this product
            const userFullName = (session.user as any).firstName && (session.user as any).lastName
                ? `${(session.user as any).firstName} ${(session.user as any).lastName}`
                : session.user.name;
            const userReview = product.reviews.find(review =>
                review.user === userFullName ||
                review.userEmail === session.user.email
            );
            setHasUserReviewed(!!userReview);
        }
    }, [session, product.reviews]);

    // Handle review form submission
    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            setReviewError('Please login to submit a review');
            return;
        }

        setIsSubmittingReview(true);
        setReviewError('');

        if (reviewForm.rating === 0) {
            setReviewError('Please select a rating');
            setIsSubmittingReview(false);
            return;
        }

        if (!reviewForm.comment.trim()) {
            setReviewError('Please write a review comment');
            setIsSubmittingReview(false);
            return;
        }

        try {
            const response = await fetch('/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: session.user.name || 'User',
                    userEmail: session.user.email,
                    userId: session.user.id,
                    product: product._id,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment.trim()
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit review');
            }

            setReviewSuccess(true);
            setReviewForm({ rating: 0, comment: '' });

            // Refresh the page after 2 seconds to show new review
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            setReviewError(error instanceof Error ? error.message : 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleRatingClick = (rating: number) => {
        setReviewForm(prev => ({ ...prev, rating }));
    };

    const handleLoginRedirect = () => {
        router.push('/auth/signin');
    };

    return (
        <div className="mt-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl overflow-hidden">
                {/* Tab Headers */}
                <div className="border-b border-[#c1a5a2]/20">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-4 px-6 border-b-2 font-medium transition-all ${activeTab === 'details'
                                ? 'border-[#9a6a63] text-[#9a6a63] bg-[#9a6a63]/5'
                                : 'border-transparent text-[#9a6a63]/70 hover:text-[#9a6a63] hover:bg-[#9a6a63]/5'
                                }`}
                        >
                            Product Details
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`flex-1 py-4 px-6 border-b-2 font-medium transition-all ${activeTab === 'reviews'
                                ? 'border-[#9a6a63] text-[#9a6a63] bg-[#9a6a63]/5'
                                : 'border-transparent text-[#9a6a63]/70 hover:text-[#9a6a63] hover:bg-[#9a6a63]/5'
                                }`}
                        >
                            Reviews ({product.reviews?.length || 0})
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    {activeTab === 'details' && (
                        <div>
                            <h3 className="text-2xl font-bold text-[#9a6a63] mb-6 flex items-center gap-2">
                                <Info size={24} />
                                Product Specifications
                            </h3>
                            {productDetails}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-8">
                            {/* Write Review Form */}
                            <div className="bg-gradient-to-br from-[#9a6a63]/5 to-[#c1a5a2]/5 rounded-2xl border border-[#c1a5a2]/20 p-6">
                                <h3 className="text-xl font-bold text-[#9a6a63] mb-6 flex items-center gap-2">
                                    <Edit3 size={20} />
                                    Write a Review
                                </h3>

                                {!session ? (
                                    // Not logged in state
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-[#9a6a63]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <LogIn className="w-8 h-8 text-[#9a6a63]" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-[#9a6a63] mb-2">Login Required</h4>
                                        <p className="text-[#9a6a63]/70 mb-6">Please login to your account to write a review for this product.</p>
                                        <button
                                            onClick={handleLoginRedirect}
                                            className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                                            style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                                        >
                                            <LogIn size={16} className="inline mr-2" />
                                            Login to Review
                                        </button>
                                    </div>
                                ) : hasUserReviewed ? (
                                    // User has already reviewed
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Star className="w-8 h-8 text-green-600" fill="currentColor" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-green-600 mb-2">Review Already Submitted</h4>
                                        <p className="text-green-700">Thank you! You have already reviewed this product.</p>
                                    </div>
                                ) : reviewSuccess ? (
                                    // Success state
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h4 className="text-lg font-semibold text-green-600 mb-2">Review Submitted!</h4>
                                        <p className="text-green-700">Thank you for your feedback. Your review will appear shortly.</p>
                                    </div>
                                ) : (
                                    // Review form
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        {/* User Info Display */}
                                        <div className="flex items-center gap-3 p-4 bg-white/50 rounded-xl border border-[#c1a5a2]/10">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#9a6a63] to-[#c1a5a2] rounded-full flex items-center justify-center text-white font-semibold">
                                                {(session.user as any).firstName?.charAt(0) || session.user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#9a6a63]">
                                                    {(session.user as any).firstName && (session.user as any).lastName
                                                        ? `${(session.user as any).firstName} ${(session.user as any).lastName}`
                                                        : session.user.name || 'User'
                                                    }
                                                </p>
                                                <p className="text-sm text-[#9a6a63]/70">Reviewing as</p>
                                            </div>
                                        </div>

                                        {/* Rating Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                                Your Rating *
                                            </label>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => handleRatingClick(star)}
                                                        className="p-1 transition-transform hover:scale-110"
                                                        disabled={isSubmittingReview}
                                                    >
                                                        <Star
                                                            size={24}
                                                            fill={star <= reviewForm.rating ? "#fbbf24" : "transparent"}
                                                            stroke={star <= reviewForm.rating ? "#fbbf24" : "#d1d5db"}
                                                            className="transition-colors"
                                                        />
                                                    </button>
                                                ))}
                                                <span className="ml-2 text-sm text-[#9a6a63]/70">
                                                    {reviewForm.rating > 0 ? `${reviewForm.rating} star${reviewForm.rating > 1 ? 's' : ''}` : 'Select rating'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Comment Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#9a6a63] mb-2">
                                                Your Review *
                                            </label>
                                            <textarea
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-[#9a6a63] placeholder:text-[#9a6a63]/50 resize-none"
                                                placeholder="Share your experience with this product..."
                                                disabled={isSubmittingReview}
                                            />
                                        </div>

                                        {/* Error Message */}
                                        {reviewError && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                                <p className="text-red-700 text-sm">{reviewError}</p>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmittingReview}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                                        >
                                            {isSubmittingReview ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={16} />
                                                    Submit Review
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Reviews Display */}
                            {reviewSection}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


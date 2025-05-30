'use client'
import Image, { ImageProps } from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ArrowRight, BookOpen, ChevronRight, Gift, LucideFlower, Star } from "lucide-react";
import Link from "next/link";
import { useProductStore } from "./stores/ProductStore";
import { useShopSettingsStore } from "./stores/SettingsStore"; // Fixed import path
import { lazy, Suspense, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

// Lazy load simple ProductCard that works with ProductEntry directly
const ProductCard = lazy(() => import("./components/ProductCard"));

// Loading fallbacks
const ProductCardSkeleton = () => (
  <div className="group rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border border-[#c1a5a2]/20 animate-pulse">
    <div className="aspect-[3/4] bg-gray-200"></div>
    <div className="p-5">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded mb-3 w-1/2"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const TestimonialSkeleton = () => (
  <div className="p-6 rounded-lg border animate-pulse" style={{ backgroundColor: "#f6eeec", borderColor: "#c1a5a240" }}>
    <div className="flex mb-4 space-x-1">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
      ))}
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
    <div className="flex items-center">
      <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
      <div>
        <div className="h-4 bg-gray-200 rounded mb-1 w-24"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

interface Collections {
  img: string;
  alt: string;
  title: string;
  description: string;
  link: string;
}

// Lazy Image Component with intersection observer
interface LazyImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  fallbackSrc?: string;
}

// Versiune îmbunătățită a LazyImage cu trigger mai robust
// LazyImage final fix
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = "",
  fill = false,
  priority = false,
  fallbackSrc,
  style,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const [shouldLoad, setShouldLoad] = useState(priority);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
    skip: priority,
    rootMargin: '100px'
  });

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setImageSrc(src);
    if (!priority) {
      setShouldLoad(false);
    }
  }, [src, priority]);

  useEffect(() => {
    if (inView && !shouldLoad && !priority) {
      console.log('🔍 Element in view, triggering load for:', src);
      setShouldLoad(true);
    }
  }, [inView, shouldLoad, priority, src]);

  const shouldLoadImage = priority || shouldLoad;

  const handleLoad = () => {
    console.log('✅ Image loaded and VISIBLE:', imageSrc);
    setIsLoaded(true);
  };

  const handleError = () => {
    console.error('❌ Image failed to load:', imageSrc);
    setHasError(true);

    if (fallbackSrc && imageSrc !== fallbackSrc) {
      console.log('🔄 Trying fallback image:', fallbackSrc);
      setImageSrc(fallbackSrc);
      setHasError(false);
      setIsLoaded(false);
    }
  };

  // Combină stilurile pentru a forța dimensiunile
  const imageStyle = {
    objectFit: 'cover' as const,
    ...(fill ? {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    } : {}),
    ...style
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={fill ? { width: '100%', height: '100%', position: 'relative' } : {}}
    >
      {shouldLoadImage && (
        <Image
          src={imageSrc}
          alt={alt}
          fill={fill}
          priority={priority}
          className={`transition-opacity duration-300 ${isLoaded && !hasError ? 'opacity-100' : 'opacity-0'
            }`}
          onLoad={handleLoad}
          onError={handleError}
          sizes={fill
            ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            : undefined
          }
          style={imageStyle}
          {...props}
        />
      )}

      {/* Loading state */}
      {shouldLoadImage && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {shouldLoadImage && hasError && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
          <span className="text-red-500 text-sm">Failed to load image</span>
        </div>
      )}

      {/* Not loaded state */}
      {!shouldLoadImage && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};
export default function Home() {
  // Product store
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const loading = useProductStore((state) => state.loading);
  const error = useProductStore((state) => state.error);
  const getFeatured = useProductStore((state) => state.getFeatured);

  // Shop settings store - Fixed import
  const { settings, loadSettings, isLoading } = useShopSettingsStore();

  // Intersection observer hooks for lazy loading sections
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [collectionsRef, collectionsInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [featuredRef, featuredInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [testimonialsRef, testimonialsInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [newsletterRef, newsletterInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [instagramRef, instagramInView] = useInView({ threshold: 0.1, triggerOnce: true });

  // Lazy load data when sections come into view
  useEffect(() => {
    if (featuredInView && !loading && getFeatured().length === 0) {
      fetchProducts();
    }
  }, [featuredInView, fetchProducts, loading, getFeatured]);

  useEffect(() => {
    // Load settings immediately for hero section
    if (!settings._id && !isLoading) {
      loadSettings();
    }
  }, [settings._id, isLoading, loadSettings]);

  const featuredProducts = getFeatured();

  // Use settings from store or fallback to defaults
  const shopName = settings.shopName || "Flowering Stories";
  const tagline = settings.tagline || "Where Stories and Blooms Unite";
  const description = settings.description || "Discover a unique blend of literature and nature in our curated collection of books, stationery, and floral arrangements.";
  const primaryColor = settings.colors?.primary || "#9c6b63";
  const secondaryColor = settings.colors?.secondary || "#c1a5a2";
  const accentColor = settings.colors?.accent || "#f6eeec";

  // Hero section content
  const heroTitle = tagline;
  const heroSubtitle = description;

  // Newsletter settings
  const newsletterEnabled = settings.features?.enableNewsletter ?? true;
  const instagramUsername = settings.socialMedia?.instagram ?
    settings.socialMedia.instagram.split('/').pop() || "FloweringStories" :
    "FloweringStories";

  // Default collections
  const collections: Collections[] = [
    {
      img: "/books-category.png",
      alt: "A cozy reading corner with stacked books, a cup of tea, and warm lighting",
      title: "Books",
      description: "Fiction, Non-fiction, Children's books, and more",
      link: "/books"
    },
    {
      img: "/stationary-category.jpg",
      alt: "Elegant stationery set with journals, pens, cards, and bookmarks on a wooden desk",
      title: "Stationery",
      description: "Journals, Cards, Bookmarks, and Writing Tools",
      link: "/products/stationeries"
    },
    {
      img: "/flowers-category.jpg",
      alt: "A bouquet of dried and fresh flowers arranged artistically with a book beside it",
      title: "Floral Arrangements",
      description: "Dried Flowers, Bookish Bouquets, and Plant Accessories",
      link: "/products/flowers"
    }
  ];

  // Features section
  const features = [
    {
      title: "Curated Collections",
      description: "Every book in our collection is hand-selected to inspire, delight, and transport you to new worlds.",
      icon: <BookOpen className="h-8 w-8" style={{ color: primaryColor }} />
    },
    {
      title: "Floral Companions",
      description: "Our unique floral arrangements complement your reading experience and bring natural beauty to your space.",
      icon: <LucideFlower className="h-8 w-8" style={{ color: primaryColor }} />
    },
    {
      title: "Perfect Gifting",
      description: "Thoughtfully crafted gift sets combining literature and floral elements for your special occasions.",
      icon: <Gift className="h-8 w-8" style={{ color: primaryColor }} />
    }
  ];

  return (
    <div>
      <Header />

      <div style={{ backgroundColor: accentColor }} className="min-h-screen">
        {/* Hero Section - Load immediately with priority */}
        <section ref={heroRef} className="relative h-[80vh] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <LazyImage
              src="/hero-image.jpg"
              alt={`${shopName} hero image`}
              fill
              className="object-cover"
              priority={true} // Load hero image immediately
            />
            <div
              className="absolute inset-0 bg-gradient-to-r to-transparent opacity-80"
              style={{
                background: `linear-gradient(to right, ${primaryColor}CC, transparent)`
              }}
            ></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center">
            <div className="max-w-xl text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-4">
                {heroTitle.split(' ').map((word: string, index: number) => {
                  const boldWords = ['Stories', 'Blooms'];
                  return boldWords.includes(word) ? (
                    <span key={index} className="font-semibold">{word} </span>
                  ) : (
                    <span key={index}>{word} </span>
                  );
                })}
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                {heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-white rounded-lg font-medium flex items-center justify-center hover:bg-opacity-90 transition"
                  style={{ color: primaryColor }}
                >
                  Explore Collection
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/about"
                  className="px-6 py-3 bg-transparent border border-white text-white rounded-lg font-medium flex items-center justify-center hover:bg-white/10 transition"
                >
                  Our Story
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section - Fixed height containers */}

        <section ref={collectionsRef} className="py-16 max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-light text-center mb-12 text-neutral-500">
            Our <span className="font-semibold" style={{ color: primaryColor }}>Collections</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link
                href={collection.link}
                key={collection.title}
                className="group relative rounded-xl overflow-hidden cursor-pointer block"
                style={{
                  height: '20rem', // 320px în rem - mai compatibil
                  minHeight: '320px', // Backup
                  position: 'relative' // Explicit pentru Next.js Image
                }}
              >
                {collectionsInView ? (
                  <div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
                    <LazyImage
                      src={collection.img}
                      alt={collection.alt}
                      fill
                      className="group-hover:scale-105 transition duration-500"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="absolute inset-0 bg-gray-200 animate-pulse"
                    style={{ width: '100%', height: '100%' }}
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 z-10">
                  <h3 className="text-white text-2xl font-medium mb-2">{collection.title}</h3>
                  <p className="text-white/80 mb-4">{collection.description}</p>
                  <div className="text-white flex items-center text-sm font-medium">
                    Browse {collection.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products - Fixed ProductCard without nested links */}
        <section ref={featuredRef} className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-light text-center mb-2 text-neutral-500">
              Featured <span className="font-semibold" style={{ color: primaryColor }}>Products</span>
            </h2>
            <p className="text-neutral-500 text-center max-w-2xl mx-auto mb-12">
              Our hand-picked selection of literary treasures and botanical delights
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredInView ? (
                <Suspense fallback={
                  Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
                }>
                  {featuredProducts.map((product) => (
                    <div key={product._id} className="group">
                      <Link href={`/products/${product._id}`} className="block">
                        <ProductCard
                          product={product}
                          showDetailedInfo={false}
                          asLink={true}
                        />
                      </Link>
                    </div>
                  ))}
                </Suspense>
              ) : (
                Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
              )}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 text-white rounded-lg transition hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                }}
              >
                View All Products
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section - Lazy load when in view */}
        <section ref={featuresRef} className="py-16" style={{ backgroundColor: accentColor }}>
          {featuresInView && (
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex flex-col items-center text-center p-6">
                    <div
                      className="p-4 rounded-full mb-4"
                      style={{ backgroundColor: `${secondaryColor}40` }}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-medium text-neutral-800 mb-2">{feature.title}</h3>
                    <p className="text-neutral-600">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Testimonial Section - Lazy load when in view */}
        <section ref={testimonialsRef} className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-light text-center mb-12 text-neutral-500">
              What Our <span className="font-semibold" style={{ color: primaryColor }}>Customers</span> Say
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonialsInView ? (
                <>
                  {/* Testimonial 1 */}
                  <div
                    className="p-6 rounded-lg border"
                    style={{
                      backgroundColor: accentColor,
                      borderColor: `${secondaryColor}40`
                    }}
                  >
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-neutral-600 mb-4 italic">
                      "I received the most beautiful book and dried flower arrangement for my birthday. The attention to detail is amazing and the selection of books is unique!"
                    </p>
                    <div className="flex items-center">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium mr-3"
                        style={{ backgroundColor: primaryColor }}
                      >
                        EJ
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">Emma Johnson</p>
                        <p className="text-xs text-neutral-500">Loyal Customer</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div
                    className="p-6 rounded-lg border"
                    style={{
                      backgroundColor: accentColor,
                      borderColor: `${secondaryColor}40`
                    }}
                  >
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-neutral-600 mb-4 italic">
                      "The literary-themed stationery set I ordered exceeded my expectations. Every time I write on these pages, I feel inspired. Truly a gem of a store!"
                    </p>
                    <div className="flex items-center">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium mr-3"
                        style={{ backgroundColor: primaryColor }}
                      >
                        MT
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">Michael Thompson</p>
                        <p className="text-xs text-neutral-500">Writer</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div
                    className="p-6 rounded-lg border"
                    style={{
                      backgroundColor: accentColor,
                      borderColor: `${secondaryColor}40`
                    }}
                  >
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-neutral-600 mb-4 italic">
                      "I've been shopping here for all my reading needs. The combination of books and floral elements makes each purchase special. Their customer service is outstanding!"
                    </p>
                    <div className="flex items-center">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium mr-3"
                        style={{ backgroundColor: primaryColor }}
                      >
                        SC
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">Sophia Chen</p>
                        <p className="text-xs text-neutral-500">Book Club Organizer</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                Array.from({ length: 3 }, (_, i) => <TestimonialSkeleton key={i} />)
              )}
            </div>
          </div>
        </section>

        {/* Newsletter Section - Conditional and lazy loaded */}
        {newsletterEnabled && (
          <section
            ref={newsletterRef}
            className="py-16"
            style={{ backgroundColor: primaryColor }}
          >
            {newsletterInView && (
              <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl font-light text-white mb-4">
                  Join Our <span className="font-semibold">Flowering Community</span>
                </h2>
                <p className="text-white/90 mb-8 max-w-xl mx-auto">
                  Subscribe to our newsletter and be the first to know about new arrivals, special offers, and literary events.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="placeholder-neutral-400 flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': secondaryColor } as React.CSSProperties}
                  />
                  <button
                    className="px-6 py-3 font-medium rounded-lg transition hover:opacity-90"
                    style={{
                      backgroundColor: secondaryColor,
                      color: primaryColor
                    }}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Instagram Feed Section - Fixed height containers */}
        {settings.socialMedia?.instagram && (
          <div ref={instagramRef} className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-6 text-neutral-500">
              <h2 className="text-3xl font-light text-center mb-2">
                Follow Us on <span className="font-semibold" style={{ color: primaryColor }}>Instagram</span>
              </h2>
              <p className="text-neutral-500 text-center max-w-2xl mx-auto mb-12">
                @{instagramUsername}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {instagramInView ? (
                  Array.from({ length: 6 }, (_, i) => (
                    <a
                      key={i}
                      href={settings.socialMedia?.instagram || "https://instagram.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-lg"
                    >
                      <LazyImage
                        src={`/instagram-${i + 1}.jpg`}
                        alt={`Instagram post ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300"
                      />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}33` }}
                      >
                        <div className="bg-white/90 p-2 rounded-full">
                          <ArrowRight className="h-4 w-4" style={{ color: primaryColor }} />
                        </div>
                      </div>
                    </a>
                  ))
                ) : (
                  Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading States */}
        {isLoading && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            Loading shop settings...
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
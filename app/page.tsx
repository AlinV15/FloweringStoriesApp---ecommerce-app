// app/page.tsx - Fixed Homepage with proper error handling
import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductCardServer from "./components/ProductCardServer";
import { ArrowRight, BookOpen, ChevronRight, Gift, LucideFlower, Star } from "lucide-react";
import Link from "next/link";
import ClientHomepage from "./components/ClientHomePage";
import connectToDatabase from "@/lib/mongodb";
import { unstable_cache } from 'next/cache';
import type { ProductEntry, ShopSettings } from "@/app/types";
import type { Product as UnifiedProduct } from "@/app/types/product";
import { Suspense } from "react";

// Optimized image component for lazy loading
const OptimizedImage = ({
  src,
  alt,
  priority = false,
  className = "",
  sizes,
  ...props
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  [key: string]: any;
}) => (
  <Image
    src={src}
    alt={alt}
    className={className}
    priority={priority}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    sizes={sizes}
    {...props}
  />
);

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

// Instagram Grid Lazy Component
const InstagramGrid = ({ socialMedia, primaryColor, instagramUsername }: {
  socialMedia?: { instagram?: string };
  primaryColor: string;
  instagramUsername: string;
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {Array.from({ length: 6 }, (_, i) => (
      <a
        key={i}
        href={socialMedia?.instagram || "https://instagram.com"}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative aspect-square overflow-hidden rounded-lg"
      >
        <OptimizedImage
          src={`/instagram-${i + 1}.jpg`}
          alt={`Instagram post ${i + 1} from @${instagramUsername}`}
          fill
          className="object-cover group-hover:scale-110 transition duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
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
    ))}
  </div>
);

// FIXED: Properly import all required models
async function ensureModelsRegistered() {
  try {
    // Import all models to ensure they're registered
    const [Product, Book, Stationary, Flower] = await Promise.all([
      import('@/lib/models/Product').then(m => m.default),
      import('@/lib/models/Book').then(m => m.default),
      import('@/lib/models/Stationary').then(m => m.default), // This was missing!
      import('@/lib/models/Flower').then(m => m.default),
    ]);

    return { Product, Book, Stationary, Flower };
  } catch (error) {
    console.error('Error importing models:', error);
    throw error;
  }
}

// ISR data fetching functions - FIXED with proper error handling
const getFeaturedProducts = unstable_cache(
  async (): Promise<UnifiedProduct[]> => {
    try {
      await connectToDatabase();

      // Ensure all models are registered
      const { Product } = await ensureModelsRegistered();

      // Fetch products with better error handling
      const products = await Product.find({
        stock: { $gt: 0 }
      })
        .populate({
          path: 'refId',
          select: '-__v'
        })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean()
        .catch((populateError: any) => {
          // If populate fails, try without populate
          console.warn('Populate failed, trying without populate:', populateError.message);
          return Product.find({
            stock: { $gt: 0 }
          })
            .sort({ createdAt: -1 })
            .limit(12)
            .lean();
        });

      if (!products || products.length === 0) {
        console.log('No products found in database');
        return [];
      }

      // Process products with better error handling
      const productEntries = products.map((product: any) => {
        try {
          const entry: ProductEntry = {
            _id: (product._id as string | { toString(): string }).toString(),
            name: product.name || 'Unnamed Product',
            ...(product.description !== undefined ? { Description: product.description } : {}),
            price: product.price || 0,
            image: product.image || '/placeholder-product.jpg',
            stock: product.stock || 0,
            type: product.type as "book" | "stationary" | "flower",
            typeRef: product.typeRef as "Book" | "Stationary" | "Flower",
            refId: product.refId?._id?.toString() || product.refId?.toString() || '',
            createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
            subcategories: product.subcategories || [],
            reviews: product.reviews || [],
            discount: product.discount || 0,
            details: product.refId || null,
          };
          return entry;
        } catch (error) {
          console.error('Error mapping product:', product._id, error);
          return null;
        }
      }).filter((product): product is ProductEntry => product !== null);

      if (productEntries.length === 0) {
        console.log('No valid product entries created');
        return [];
      }

      // Use featured algorithm or fallback
      let featuredEntries: ProductEntry[] = [];

      try {
        const { getFeaturedProductsBayesian } = await import('@/lib/utils/rating');
        featuredEntries = getFeaturedProductsBayesian(productEntries, 4, 0);
      } catch (importError) {
        console.warn('Rating utils not available, using simple selection');
        featuredEntries = productEntries.slice(0, 4);
      }

      // Convert to unified Product format
      try {
        const { convertProductEntryToProduct } = await import('@/app/types/product');

        const unifiedProducts = featuredEntries.map(item => {
          try {
            return convertProductEntryToProduct(item);
          } catch (error) {
            console.error('Error converting product entry:', item._id, error);
            return null;
          }
        }).filter((product): product is UnifiedProduct => product !== null);

        return unifiedProducts;
      } catch (conversionError) {
        console.error('Product conversion module not available:', conversionError);
        // Return empty array rather than crashing
        return [];
      }

    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      return []; // Return empty array instead of throwing
    }
  },
  ['featured-products'],
  {
    revalidate: 3600,
    tags: ['products', 'featured']
  }
);

const getShopSettings = unstable_cache(
  async (): Promise<ShopSettings> => {
    try {
      await connectToDatabase();

      const { default: ShopSettingsModel } = await import('@/lib/models/ShopSettings');
      const settingsRaw = await ShopSettingsModel.findOne().lean();
      const settings = (settingsRaw && !Array.isArray(settingsRaw)) ? settingsRaw : null;

      const defaultSettings: ShopSettings = {
        _id: "default",
        shopName: "Flowering Stories",
        tagline: "Where Stories and Blooms Unite",
        description: "Discover a unique blend of literature and nature in our curated collection of books, stationery, and floral arrangements.",
        logo: {},
        colors: {
          primary: "#9c6b63",
          secondary: "#c1a5a2",
          accent: "#f6eeec"
        },
        currency: "EUR",
        timezone: "Europe/Bucharest",
        paymentMethods: ["stripe"],
        shippingSettings: {
          freeShippingThreshold: 50,
          defaultShippingCost: 5,
          enableLocalPickup: true
        },
        contact: {
          email: "contact@floweringstories.com",
          address: {
            country: "Romania"
          }
        },
        socialMedia: {
          instagram: "https://instagram.com/floweringstories"
        },
        businessHours: [],
        features: {
          enableReviews: true,
          enableWishlist: true,
          enableNewsletter: true,
          enableNotifications: true,
          maintenanceMode: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return settings ? {
        ...defaultSettings,
        ...settings,
        _id: (settings as any)._id?.toString() || defaultSettings._id,
        createdAt: (settings as any).createdAt?.toISOString() || defaultSettings.createdAt,
        updatedAt: (settings as any).updatedAt?.toISOString() || defaultSettings.updatedAt,
      } : defaultSettings;

    } catch (error) {
      console.error('Error fetching shop settings:', error);
      return {
        _id: "default",
        shopName: "Flowering Stories",
        tagline: "Where Stories and Blooms Unite",
        description: "Discover a unique blend of literature and nature in our curated collection of books, stationery, and floral arrangements.",
        logo: {},
        colors: {
          primary: "#9c6b63",
          secondary: "#c1a5a2",
          accent: "#f6eeec"
        },
        currency: "EUR",
        timezone: "Europe/Bucharest",
        paymentMethods: ["stripe"],
        shippingSettings: {
          freeShippingThreshold: 50,
          defaultShippingCost: 5,
          enableLocalPickup: true
        },
        features: {
          enableReviews: true,
          enableWishlist: true,
          enableNewsletter: true,
          enableNotifications: true,
          maintenanceMode: false
        },
        businessHours: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },
  ['shop-settings'],
  {
    revalidate: 7200,
    tags: ['settings']
  }
);

// Static collections data cu dimensiuni optimizate
const collections = [
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

// Server Component pentru homepage
export default async function HomePage() {
  // Use Promise.allSettled to handle partial failures gracefully
  const results = await Promise.allSettled([
    getFeaturedProducts(),
    getShopSettings()
  ]);

  // Extract results with fallbacks
  const featuredProducts = results[0].status === 'fulfilled' ? results[0].value : [];
  const settings = results[1].status === 'fulfilled' ? results[1].value : {
    shopName: "Flowering Stories",
    tagline: "Where Stories and Blooms Unite",
    description: "Discover a unique blend of literature and nature in our curated collection of books, stationery, and floral arrangements.",
    colors: { primary: "#9c6b63", secondary: "#c1a5a2", accent: "#f6eeec" },
    features: { enableNewsletter: true },
    socialMedia: { instagram: "https://instagram.com/floweringstories" }
  } as ShopSettings;

  // Log results for debugging
  if (results[0].status === 'rejected') {
    console.error('Failed to load featured products:', results[0].reason);
  }
  if (results[1].status === 'rejected') {
    console.error('Failed to load settings:', results[1].reason);
  }

  console.log('ISR Featured Products:', featuredProducts.length, featuredProducts[0]?.name);
  console.log('ISR Settings:', settings.shopName);

  const {
    shopName,
    tagline,
    description,
    colors: { primary: primaryColor, secondary: secondaryColor, accent: accentColor },
    features: { enableNewsletter },
    socialMedia
  } = settings;

  const instagramUsername = socialMedia?.instagram ?
    socialMedia.instagram.split('/').pop() || "FloweringStories" :
    "FloweringStories";

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
    <>
      <Header />

      <div style={{ backgroundColor: accentColor }} className="min-h-screen">
        {/* Hero Section - OPTIMIZED */}
        <section className="relative h-[80vh] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <OptimizedImage
              src="/hero-image.jpg"
              alt={`${shopName} hero image showing books and flowers in a cozy setting`}
              fill
              className="object-cover"
              priority={true}
              quality={85}
              sizes="100vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r to-transparent opacity-80"
              style={{
                background: `linear-gradient(to right, ${primaryColor}CC, transparent)`
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center">
            <div className="max-w-xl text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-4">
                {(tagline ?? '').split(' ').map((word: string, index: number) => {
                  const boldWords = ['Stories', 'Blooms'];
                  return boldWords.includes(word) ? (
                    <span key={index} className="font-semibold">{word} </span>
                  ) : (
                    <span key={index}>{word} </span>
                  );
                })}
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                {description}
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

        {/* Collections Section - OPTIMIZED */}
        <section className="py-16 max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-light text-center mb-12 text-neutral-500">
            Our <span className="font-semibold" style={{ color: primaryColor }}>Collections</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
              <Link
                href={collection.link}
                key={collection.title}
                className="group relative rounded-xl overflow-hidden cursor-pointer block h-80"
              >
                <OptimizedImage
                  src={collection.img}
                  alt={collection.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 2}
                />
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

        {/* Featured Products - OPTIMIZED with priority loading */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-light text-center mb-2 text-neutral-500">
              Featured <span className="font-semibold" style={{ color: primaryColor }}>Products</span>
            </h2>
            <p className="text-neutral-500 text-center max-w-2xl mx-auto mb-12">
              Our hand-picked selection of literary treasures and botanical delights
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product: UnifiedProduct, index: number) => (
                  <Link key={product._id} href={`/products/${product._id}`} className="block">
                    <ProductCardServer
                      product={product}
                      priority={index < 2} // First 2 products get priority loading
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </Link>
                ))
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

        {/* Rest of the sections remain the same... */}
        {/* Features Section */}
        <section className="py-16" style={{ backgroundColor: accentColor }}>
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
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        {enableNewsletter && (
          <section className="py-16" style={{ backgroundColor: primaryColor }}>
            <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
              <h2 className="text-3xl font-light text-white mb-4">
                Join Our <span className="font-semibold">Flowering Community</span>
              </h2>
              <p className="text-white/90 mb-8 max-w-xl mx-auto">
                Subscribe to our newsletter and be the first to know about new arrivals, special offers, and literary events.
              </p>

              <Suspense fallback={<div className="animate-pulse bg-white/20 h-12 rounded"></div>}>
                <ClientHomepage primaryColor={primaryColor} secondaryColor={secondaryColor} />
              </Suspense>
            </div>
          </section>
        )}

        {/* Instagram Feed Section - LAZY LOADED */}
        {socialMedia?.instagram && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-6 text-neutral-500">
              <h2 className="text-3xl font-light text-center mb-2">
                Follow Us on <span className="font-semibold" style={{ color: primaryColor }}>Instagram</span>
              </h2>
              <p className="text-neutral-500 text-center max-w-2xl mx-auto mb-12">
                @{instagramUsername}
              </p>

              <Suspense fallback={
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              }>
                <InstagramGrid
                  socialMedia={socialMedia}
                  primaryColor={primaryColor}
                  instagramUsername={instagramUsername}
                />
              </Suspense>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
}

// Generate metadata for SEO - OPTIMIZED
export async function generateMetadata() {
  try {
    const settings = await getShopSettings();

    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
      title: settings.seo?.metaTitle || `${settings.shopName} - ${settings.tagline}`,
      description: settings.seo?.metaDescription || settings.description,
      keywords: settings.seo?.keywords?.join(', ') || 'books, stationery, flowers, literary gifts, reading, bookstore',
      openGraph: {
        title: settings.seo?.metaTitle || `${settings.shopName} - ${settings.tagline}`,
        description: settings.seo?.metaDescription || settings.description,
        images: [
          {
            url: '/hero-image.jpg',
            width: 1200,
            height: 630,
            alt: settings.shopName,
          }
        ],
        type: 'website',
        locale: 'en_US',
        siteName: settings.shopName,
      },
      twitter: {
        card: 'summary_large_image',
        title: settings.seo?.metaTitle || `${settings.shopName} - ${settings.tagline}`,
        description: settings.seo?.metaDescription || settings.description,
        images: ['/hero-image.jpg'],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: '/',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    // Return fallback metadata
    return {
      title: 'Flowering Stories - Where Stories and Blooms Unite',
      description: 'Discover a unique blend of literature and nature in our curated collection of books, stationery, and floral arrangements.',
    };
  }
}
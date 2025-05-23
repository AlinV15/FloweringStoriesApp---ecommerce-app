'use client'
import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ArrowRight, BookOpen, ChevronRight, Gift, LucideFlower, Star } from "lucide-react";
import Link from "next/link";
import { useProductStore } from "./stores/ProductStore";
import { use, useEffect } from "react";
import { getAverageRating } from "@/lib/utils/rating";
import ProductCard from "./components/ProductCard";

interface Collections {
  img: string;
  alt: string;
  title: string;
  description: string;
  link: string;
}

export default function Home() {
  //using the zustand store to get the products
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const loading = useProductStore((state) => state.loading);
  const error = useProductStore((state) => state.error);
  const getFeatured = useProductStore((state) => state.getFeatured);
  const getBestseller = useProductStore((state) => state.getBestseller);
  const getNewest = useProductStore((state) => state.getNewest);

  useEffect(() => {
    fetchProducts();
  }
    , [fetchProducts]);

  const featuredProducts = getFeatured();
  const bestseller = getBestseller();
  const newestProduct = getNewest();

  // Manage collections
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


  return (
    <div>
      <Header />


      <div className="bg-[#fdf8f6] min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[80vh] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-image.jpg"
              alt="Books and flowers arrangement"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#9c6b63]/80 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center">
            <div className="max-w-xl text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-4">
                Where <span className="font-semibold">Stories</span> and <span className="font-semibold">Blooms</span> Unite
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Discover a unique blend of literature and nature in our curated collection of books, stationery, and floral arrangements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-white text-[#9c6b63] rounded-lg font-medium flex items-center justify-center hover:bg-opacity-90 transition"
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

        {/* Categories Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-light text-center mb-12 text-neutral-500">
            Our <span className="font-semibold text-[#9c6b63]">Collections</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Books Category */}
            {collections.map((collection) => (
              <div className="group relative rounded-xl overflow-hidden h-80 cursor-pointer" key={collection.title}>
                <Image
                  src={collection.img}
                  alt={collection.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-2xl font-medium mb-2">{collection.title}</h3>
                  <p className="text-white/80 mb-4">{collection.description}</p>
                  <Link
                    href={collection.link}
                    className="text-white flex items-center text-sm font-medium"
                  >
                    Browse {collection.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}


          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-light text-center mb-2 text-neutral-500">
              Featured <span className="font-semibold text-[#9c6b63]">Products</span>
            </h2>
            <p className="text-neutral-500 text-center max-w-2xl mx-auto mb-12">
              Our hand-picked selection of literary treasures and botanical delights
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Featured Products */}
              {
                featuredProducts.map((product) => (
                  <Link key={product._id} href={`/products/${product._id}`} className="group">

                    <ProductCard product={product} bestseller={bestseller} newestProduct={newestProduct} />
                  </Link>))
              }

            </div>
            <div className="text-center mt-10">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-[#9c6b63] hover:bg-[#875a53] text-white rounded-lg transition"
              >
                View All Products
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-[#fdf8f6]">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-[#f5e1dd] p-4 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-[#9c6b63]" />
                </div>
                <h3 className="text-xl font-medium text-neutral-800 mb-2">Curated Collections</h3>
                <p className="text-neutral-600">
                  Every book in our collection is hand-selected to inspire, delight, and transport you to new worlds.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-[#f5e1dd] p-4 rounded-full mb-4">
                  <LucideFlower className="h-8 w-8 text-[#9c6b63]" />
                </div>
                <h3 className="text-xl font-medium text-neutral-800 mb-2">Floral Companions</h3>
                <p className="text-neutral-600">
                  Our unique floral arrangements complement your reading experience and bring natural beauty to your space.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-[#f5e1dd] p-4 rounded-full mb-4">
                  <Gift className="h-8 w-8 text-[#9c6b63]" />
                </div>
                <h3 className="text-xl font-medium text-neutral-800 mb-2">Perfect Gifting</h3>
                <p className="text-neutral-600">
                  Thoughtfully crafted gift sets combining literature and floral elements for your special occasions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-light text-center mb-12 text-neutral-500">
              What Our <span className="font-semibold text-[#9c6b63]">Customers</span> Say
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-[#fdf8f6] p-6 rounded-lg border border-[#f0e4e0]">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-4 italic">
                  "I received the most beautiful book and dried flower arrangement for my birthday. The attention to detail is amazing and the selection of books is unique!"
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#9c6b63] flex items-center justify-center text-white font-medium mr-3">
                    EJ
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">Emma Johnson</p>
                    <p className="text-xs text-neutral-500">Loyal Customer</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-[#fdf8f6] p-6 rounded-lg border border-[#f0e4e0]">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-4 italic">
                  "The literary-themed stationery set I ordered exceeded my expectations. Every time I write on these pages, I feel inspired. Truly a gem of a store!"
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#9c6b63] flex items-center justify-center text-white font-medium mr-3">
                    MT
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">Michael Thompson</p>
                    <p className="text-xs text-neutral-500">Writer</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-[#fdf8f6] p-6 rounded-lg border border-[#f0e4e0]">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-4 italic">
                  "I've been shopping here for all my reading needs. The combination of books and floral elements makes each purchase special. Their customer service is outstanding!"
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#9c6b63] flex items-center justify-center text-white font-medium mr-3">
                    SC
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">Sophia Chen</p>
                    <p className="text-xs text-neutral-500">Book Club Organizer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-[#9c6b63]">
          <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-light text-white mb-4 ">
              Join Our <span className="font-semibold">Flowering Community</span>
            </h2>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">
              Subscribe to our newsletter and be the first to know about new arrivals, special offers, and literary events.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="placeholder-neutral-400 flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5e1dd] bg-white"
              />
              <button className="px-6 py-3 bg-[#f5e1dd] hover:bg-[#f0d1cc] text-[#9c6b63] font-medium rounded-lg transition">
                Subscribe
              </button>
            </div>
          </div>
        </section>

        {/* Instagram Feed Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-neutral-500">
            <h2 className="text-3xl font-light text-center mb-2">
              Follow Us on <span className="font-semibold text-[#9c6b63]">Instagram</span>
            </h2>
            <p className="text-neutral-500 text-center max-w-2xl mx-auto mb-12">
              @FloweringStories
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Instagram Images - 6 images */}
              {[...Array(6)].map((_, i) => (
                <a key={i} href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={`/instagram-${i + 1}.jpg`}
                    alt={`Instagram post ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-[#9c6b63]/20 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <div className="bg-white/90 p-2 rounded-full">
                      <ArrowRight className="h-4 w-4 text-[#9c6b63]" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
import React from 'react'
import { ProductEntry } from '../types'
import Image from 'next/image'
import { getAverageRating } from '@/lib/utils/rating'
import { Star } from 'lucide-react'


type Props = {
    product: ProductEntry
    bestseller?: ProductEntry | null
    newestProduct?: ProductEntry | null
}

const ProductCard = ({ product, bestseller, newestProduct }: Props) => {
    return (
        <div className="group" key={product._id}>
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                />
                {bestseller ? (
                    <div className="absolute top-2 right-2 bg-[#9c6b63] text-white text-xs px-2 py-1 rounded">
                        Bestseller
                    </div>
                ) : newestProduct ? (
                    <div className="absolute top-2 right-2 bg-[#9c6b63] text-white text-xs px-2 py-1 rounded">
                        New
                    </div>
                ) : null}
            </div>
            <h3 className="font-medium text-neutral-800 mb-1">{product.name}</h3>
            <div className="flex items-center mb-1">
                <div className="flex">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(getAverageRating(product))
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-neutral-300'
                                }`}
                        />
                    ))}
                </div>
                <span className="text-xs text-neutral-500 ml-1">{product.reviews.length}</span>
            </div>
            <div className="flex items-center justify-between">
                <p className="font-medium text-[#9c6b63]">${product.price}</p>
                <button className="text-xs bg-[#f5e1dd] hover:bg-[#f0d1cc] text-[#9c6b63] py-1 px-3 rounded transition">
                    Add to Cart
                </button>
            </div>
        </div>
    )
}

export default ProductCard
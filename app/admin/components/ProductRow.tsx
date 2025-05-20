'use client';

import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { ProductEntry } from '@/app/types/index';

interface Props {
    product: ProductEntry;
    onEdit: () => void;
    onDelete: () => void;
}

const ProductRow = ({ product, onEdit, onDelete }: Props) => {
    return (
        <tr className="border-t hover:bg-[#fdf4f1]/60 transition duration-200">
            <td className="p-2">
                <div className="w-12 h-12 relative">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                    />
                </div>
            </td>
            <td className="p-2 text-[#9c6b63] font-medium">{product.name}</td>
            <td className="p-2 capitalize text-neutral-600">{product.type}</td>
            <td className="p-2 text-neutral-600">{product.price.toFixed(2)} RON</td>
            <td className="p-2 text-neutral-600">{product.stock}</td>
            <td className="p-2">
                <div className="flex gap-2 items-center">
                    <button
                        onClick={onEdit}
                        title="Edit"
                        className="p-2 rounded-md hover:bg-[#f5e1dd] text-[#9c6b63] hover:text-[#8a5b53] transition"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-neutral-300"></div>

                    <button
                        onClick={onDelete}
                        title="Delete"
                        className="p-2 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ProductRow;

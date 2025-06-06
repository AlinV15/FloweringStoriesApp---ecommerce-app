'use client';

import Image from 'next/image';
import { Pencil, Trash2, Tags, AlertCircle, BookOpen, Box, Flower } from 'lucide-react';
import { memo, useState } from 'react';

// Updated to match your mongoose model
interface ProductEntry {
    _id: string;
    type: 'book' | 'stationary' | 'flower';
    refId: string;
    typeRef: 'Book' | 'Stationary' | 'Flower';
    price: number;
    name: string;
    discount?: number;
    Description?: string;
    subcategories?: Array<any>; // Allow for both string IDs and objects
    image?: string;
    stock: number;
    reviews?: Array<any>;
    createdAt?: string;
    updatedAt?: string;
    __v?: number; // Add version field that's mentioned in the error
}

interface Props {
    product: ProductEntry;
    onEdit: () => void;
    onDelete: () => void;
    onManageSubcategories: () => void;
}

// Handle subcategories which might be objects or string IDs
const SubcategoriesList = memo(({ subcategories }: { subcategories?: Array<any> }) => {
    const [expanded, setExpanded] = useState(false);

    if (!subcategories || subcategories.length === 0) {
        return <span className="text-sm text-neutral-400 italic">No categories assigned</span>;
    }

    // Show limited number when not expanded
    const displayLimit = 3;
    const hasMore = subcategories.length > displayLimit;
    const displaySubcategories = expanded ? subcategories : subcategories.slice(0, displayLimit);

    return (
        <div className="flex flex-wrap gap-1.5 items-center">
            {displaySubcategories.map((subcat, index) => {
                // Handle different possible formats of subcategories
                const key = typeof subcat === 'string' ? subcat :
                    subcat._id ? subcat._id :
                        `subcat-${index}`;

                const displayText = typeof subcat === 'string' ? subcat.substring(0, 8) + '...' :
                    subcat.name ? subcat.name :
                        JSON.stringify(subcat).substring(0, 8) + '...';

                return (
                    <span
                        key={key}
                        className="text-xs bg-[#f5e1dd] text-[#9c6b63] px-2 py-1 rounded-full font-medium whitespace-nowrap"
                    >
                        {displayText}
                    </span>
                );
            })}

            {hasMore && !expanded && (
                <button
                    onClick={() => setExpanded(true)}
                    className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full hover:bg-neutral-200 transition"
                >
                    +{subcategories.length - displayLimit} more
                </button>
            )}

            {expanded && (
                <button
                    onClick={() => setExpanded(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-700 transition"
                >
                    Show less
                </button>
            )}
        </div>
    );
});

SubcategoriesList.displayName = 'SubcategoriesList';

// Action button component to improve readability and reusability
interface ActionButtonProps {
    onClick: () => void;
    title: string;
    className?: string;
    icon: React.ReactNode;
    label?: string;
    variant?: 'primary' | 'danger' | 'neutral';
    iconOnly?: boolean;
    disabled?: boolean;
}

const ActionButton = memo(({
    onClick,
    title,
    className,
    icon,
    label,
    variant = 'primary',
    iconOnly = false,
    disabled = false
}: ActionButtonProps) => {
    // Base styles for all buttons
    const baseClassName = "flex items-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-1";

    // Variant-specific styles
    const variantClassNames = {
        primary: "hover:bg-[#f5e1dd] text-[#9c6b63] hover:text-[#8a5b53] focus:ring-[#e0c4bd]",
        danger: "hover:bg-red-50 text-red-600 hover:text-red-700 focus:ring-red-200",
        neutral: "hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800 focus:ring-neutral-200"
    };

    // Size and padding based on whether it's icon-only
    const sizeClassName = iconOnly
        ? "p-2"
        : "px-3 py-2 gap-1.5";

    const disabledClassName = disabled
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer";

    return (
        <button
            onClick={onClick}
            title={title}
            className={`${baseClassName} ${variantClassNames[variant]} ${sizeClassName} ${disabledClassName} ${className || ''}`}
            disabled={disabled}
            aria-label={title}
        >
            {icon}
            {!iconOnly && label && <span className="text-sm font-medium">{label}</span>}
        </button>
    );
});

ActionButton.displayName = 'ActionButton';

const ProductRow = memo(({ product, onEdit, onDelete, onManageSubcategories }: Props) => {
    const [imageError, setImageError] = useState(false);
    const formattedPrice = new Intl.NumberFormat('fr-Fr', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(product.price);

    const stockStatus = product.stock <= 0
        ? { label: 'Out of stock', className: 'text-red-600 bg-red-50 border-red-100' }
        : product.stock < 5
            ? { label: 'Low stock', className: 'text-amber-600 bg-amber-50 border-amber-100' }
            : { label: product.stock, className: 'text-green-600 bg-green-50 border-green-100' };

    // Type-specific icons
    const getTypeIcon = () => {
        switch (product.type) {
            case 'book':
                return <BookOpen size={16} className="mr-1" />;
            case 'stationary':
                return <Box size={16} className="mr-1" />;
            case 'flower':
                return <Flower size={16} className="mr-1" />;
            default:
                return null;
        }
    };

    // Safely calculate discounted price if available
    const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
    const formattedFinalPrice = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(finalPrice);


    return (
        <tr className="border-t border-neutral-200 hover:bg-[#fdf4f1]/60 transition duration-200">
            <td className="p-3">
                <div className="w-14 h-14 relative rounded-lg overflow-hidden border border-neutral-200 bg-white">
                    {imageError || !product.image ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                            <AlertCircle size={20} className="text-neutral-400" />
                        </div>
                    ) : (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                            priority={false}
                            onError={() => setImageError(true)}
                        />
                    )}
                </div>
            </td>

            <td className="p-3">
                <div className="flex flex-col">
                    <span className="text-[#9c6b63] font-medium">{product.name}</span>
                    {product.Description && (
                        <span className="text-xs text-neutral-500 line-clamp-1">{product.Description}</span>
                    )}
                    <span className="text-xs text-neutral-500">ID: {typeof product._id === 'string' ? product._id.substring(0, 8) : 'N/A'}...</span>
                </div>
            </td>

            <td className="p-3">
                <span className="capitalize flex items-center text-neutral-700 font-medium px-2.5 py-1 bg-neutral-100 rounded-full text-sm">
                    {getTypeIcon()}
                    {product.typeRef}
                </span>
            </td>

            <td className="p-3">
                <div className="flex flex-col">
                    <span className="text-neutral-700 font-medium">
                        {formattedFinalPrice}
                    </span>
                    {product.discount && (
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-neutral-400 line-through">{formattedPrice}</span>
                            <span className="text-xs bg-green-50 text-green-600 px-1 rounded">-{product.discount}%</span>
                        </div>
                    )}
                </div>
            </td>

            <td className="p-3">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-sm font-medium border ${stockStatus.className}`}>
                    {stockStatus.label}
                </span>
            </td>

            <td className="p-3">
                <SubcategoriesList subcategories={product.subcategories} />
            </td>

            <td className="p-3">
                <div className="flex gap-2 items-center">
                    <ActionButton
                        onClick={onEdit}
                        title="Edit product"
                        icon={<Pencil size={18} />}
                        iconOnly
                        variant="primary"
                    />

                    <ActionButton
                        onClick={onDelete}
                        title="Delete product"
                        icon={<Trash2 size={18} />}
                        iconOnly
                        variant="danger"
                    />

                    <div className="h-6 w-px bg-neutral-300 mx-1"></div>

                    <ActionButton
                        onClick={onManageSubcategories}
                        title="Manage categories"
                        icon={<Tags size={18} />}
                        label="Categories"
                        variant="neutral"
                    />

                    {product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0 && (
                        <span
                            className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                            title={`${product.reviews.length} reviews`}
                        >
                            <span className="font-medium">{product.reviews.length}</span>
                            reviews
                        </span>
                    )}
                </div>
            </td>
        </tr>
    );
});

ProductRow.displayName = 'ProductRow';

export default ProductRow;
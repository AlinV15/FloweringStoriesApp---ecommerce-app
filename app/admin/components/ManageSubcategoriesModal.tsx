'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Search, X, Image as ImageIcon } from 'lucide-react';
import useSubcategoryStore from '@/app/stores/SubcategoryStore';

interface Subcategory {
    _id: string;
    name: string;
    type: string;
    description?: string;
    image?: string;
}

interface Props {
    productId: string;
    currentType: string;
    currentSubcategories: Subcategory[];
    onClose: () => void;
    onUpdated: () => void;
}

export default function ManageSubcategoriesModal({
    productId,
    currentType,
    currentSubcategories,
    onClose,
    onUpdated,
}: Props) {
    const { subcategories: storeSubcategories, loading: storeLoading, fetchSubcategories } = useSubcategoryStore();
    const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>(
        currentSubcategories.map((s) => s._id)
    );
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchSubcategories();
    }, [fetchSubcategories]);

    useEffect(() => {
        if (storeSubcategories.length > 0) {
            const filtered = storeSubcategories.filter((s: Subcategory) => s?.type === currentType);
            setAllSubcategories(filtered);
        }
    }, [storeSubcategories, currentType]);

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleImageError = (subcategoryId: string) => {
        setImageLoadErrors(prev => new Set(prev).add(subcategoryId));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/product/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subcategories: selectedIds }),
            });

            if (res.ok) {
                toast.success('Subcategories updated successfully!', {
                    duration: 3000,
                    style: {
                        background: '#10b981',
                        color: 'white',
                        fontWeight: '500',
                    },
                });
                onUpdated();
                onClose();
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update subcategories');
            }
        } catch (error) {

            const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting';
            toast.error(errorMessage, {
                duration: 4000,
                style: {
                    background: '#ef4444',
                    color: 'white',
                    fontWeight: '500',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredSubcategories = searchTerm
        ? allSubcategories.filter(sub =>
            sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.description && sub.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : allSubcategories;

    const selectedCount = selectedIds.length;
    const hasChanges = selectedIds.length !== currentSubcategories.length ||
        !selectedIds.every(id => currentSubcategories.some(sub => sub._id === id));

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-neutral-800"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-labelledby="manage-subcategories-title"
            aria-modal="true"
        >
            <div className="bg-white rounded-3xl p-0 w-full max-w-2xl shadow-2xl border border-neutral-100 animate-fadeIn max-h-[90vh] flex flex-col text-neutral-800">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-4 border-b border-neutral-100">
                    <div>
                        <h2 id="manage-subcategories-title" className="text-2xl font-bold text-gray-900">
                            Assign Subcategories
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {selectedCount} selected • {currentType} products
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200"
                        aria-label="Close dialog"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search subcategories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#9c6b63] focus:ring-4 focus:ring-[#9c6b63]/10 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden px-6">
                    {storeLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="relative">
                                <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#9c6b63] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-gray-500 mt-4 font-medium">Loading subcategories...</p>
                            <p className="text-gray-400 text-sm mt-1">Please wait while we fetch the data</p>
                        </div>
                    ) : filteredSubcategories.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">
                                {searchTerm ? 'No subcategories match your search' : 'No subcategories available'}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchTerm ? 'Try adjusting your search terms' : `No subcategories found for ${currentType} products`}
                            </p>
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                            {filteredSubcategories.map((sub) => (
                                <label
                                    key={sub._id}
                                    className={`group flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md ${selectedIds.includes(sub._id)
                                        ? 'bg-gradient-to-r from-[#9c6b63]/5 to-[#9c6b63]/10 border-[#9c6b63]/30 shadow-sm'
                                        : 'bg-white border-gray-200 hover:border-[#9c6b63]/20 hover:bg-gray-50/50'
                                        }`}
                                >
                                    {/* Checkbox */}
                                    <div className="relative flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(sub._id)}
                                            onChange={() => toggleSelect(sub._id)}
                                            className="sr-only"
                                            aria-labelledby={`subcategory-${sub._id}`}
                                        />
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${selectedIds.includes(sub._id)
                                            ? 'bg-[#9c6b63] border-[#9c6b63] scale-110'
                                            : 'border-gray-300 group-hover:border-[#9c6b63]/50'
                                            }`}>
                                            {selectedIds.includes(sub._id) && (
                                                <Check size={16} className="text-white" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Image */}
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        {sub.image && !imageLoadErrors.has(sub._id) ? (
                                            <img
                                                src={sub.image}
                                                alt={sub.name}
                                                className="w-full h-full object-cover"
                                                onError={() => handleImageError(sub._id)}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon size={20} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 id={`subcategory-${sub._id}`} className="font-semibold text-gray-900 truncate">
                                            {sub.name}
                                        </h3>
                                        {sub.description && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                {sub.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Selection indicator */}
                                    {selectedIds.includes(sub._id) && (
                                        <div className="w-2 h-2 rounded-full bg-[#9c6b63] flex-shrink-0"></div>
                                    )}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {hasChanges ? (
                                <span className="text-[#9c6b63] font-medium">Unsaved changes</span>
                            ) : (
                                <span>No changes</span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={loading || !hasChanges}
                                className="px-6 py-2.5 rounded-xl bg-[#9c6b63] text-white hover:bg-[#835852] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center min-w-32 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#9c6b63]"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
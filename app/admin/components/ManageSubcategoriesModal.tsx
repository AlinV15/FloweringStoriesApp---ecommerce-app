'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Loader2, Search, X } from 'lucide-react';
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

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/product/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subcategories: selectedIds }),
            });

            if (res.ok) {
                toast.success('Subcategories updated successfully!');
                onUpdated();
                onClose();
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update subcategories');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update subcategories');
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

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-labelledby="manage-subcategories-title"
            aria-modal="true"
        >
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-neutral-200 animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <h2 id="manage-subcategories-title" className="text-xl font-semibold text-[#3f3f3f]">
                        Assign Subcategories
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
                        aria-label="Close dialog"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="relative mb-4">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search subcategories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 focus:border-[#9c6b63] focus:ring-2 focus:ring-[#f5e1dd] outline-none transition-all"
                    />
                </div>

                {storeLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="animate-spin h-8 w-8 text-[#9c6b63]" />
                    </div>
                ) : filteredSubcategories.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                        {searchTerm ? 'No subcategories match your search' : 'No subcategories available for this type'}
                    </div>
                ) : (
                    <div className="max-h-64 overflow-y-auto pr-2 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredSubcategories.map((sub) => (
                            <label
                                key={sub._id}
                                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${selectedIds.includes(sub._id)
                                        ? 'bg-[#f5e1dd] border-[#e0c4bd]'
                                        : 'bg-white border-neutral-200 hover:border-[#e0c4bd] hover:bg-[#fefaf9]'
                                    }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(sub._id)}
                                        onChange={() => toggleSelect(sub._id)}
                                        className="sr-only"
                                        aria-labelledby={`subcategory-${sub._id}`}
                                    />
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedIds.includes(sub._id)
                                            ? 'bg-[#9c6b63] border-[#9c6b63]'
                                            : 'border-neutral-300'
                                        }`}>
                                        {selectedIds.includes(sub._id) && (
                                            <Check size={14} className="text-white" />
                                        )}
                                    </div>
                                </div>
                                <span id={`subcategory-${sub._id}`} className="text-sm font-medium text-neutral-800">
                                    {sub.name}
                                </span>
                            </label>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 justify-end mt-4 border-t border-neutral-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-[#9c6b63] text-white hover:bg-[#835852] transition shadow-sm flex items-center justify-center min-w-24"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
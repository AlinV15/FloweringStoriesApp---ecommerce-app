'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import SubcategoryFormModal from '../../components/SubcategoryFormModal';
import DeleteConfirmCatModal from '../../components/DeleteConfirmCatModal';
import { Pencil, Trash2, Plus, BookOpen, Pen, Flower2, Search, Filter, Grid3X3, List } from 'lucide-react';
import useSubcategoryStore from '@/app/stores/SubcategoryStore';
import { Subcategory } from '@/app/types';
import { useShopSettings } from '@/contexts/ShopSettingsContext';

export default function CategoriesPage() {
    const { subcategories, loading, error, fetchSubcategories, setSubcategories } = useSubcategoryStore();
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editData, setEditData] = useState<Subcategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Subcategory | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'book' | 'stationary' | 'flower'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { settings } = useShopSettings();

    // Get colors from settings
    const primaryColor = settings?.colors?.primary || '#9c6b63';
    const secondaryColor = settings?.colors?.secondary || '#c1a5a2';
    const accentColor = settings?.colors?.accent || '#f6eeec';

    useEffect(() => {
        fetchSubcategories();
    }, [fetchSubcategories]);

    // Type icons mapping
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'book': return <BookOpen size={18} />;
            case 'stationary': return <Pen size={18} />;
            case 'flower': return <Flower2 size={18} />;
            default: return null;
        }
    };

    // Type colors mapping using shop theme
    const getTypeStyles = (type: string) => {
        const baseColor = primaryColor;
        switch (type) {
            case 'book':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    badge: 'bg-blue-100 text-blue-700 border-blue-200',
                    button: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
                };
            case 'stationary':
                return {
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-200',
                    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    button: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                };
            case 'flower':
                return {
                    bg: 'bg-pink-50',
                    border: 'border-pink-200',
                    badge: 'bg-pink-100 text-pink-700 border-pink-200',
                    button: 'bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    badge: 'bg-gray-100 text-gray-700 border-gray-200',
                    button: 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                };
        }
    };

    // Filter and search logic
    const filteredCategories = subcategories.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || cat.type === filterType;
        return matchesSearch && matchesFilter;
    });

    // Get category counts by type
    const categoryCounts = subcategories.reduce((acc, cat) => {
        acc[cat.type] = (acc[cat.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const handleEditClick = (category: Subcategory) => {
        setEditData(category);
        setShowFormModal(true);
    };

    const handleDeleteClick = (category: Subcategory) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDeleteModal(false);
        setEditData(null);
        setCategoryToDelete(null);
    };

    const handleCategoryDeleted = () => {
        fetchSubcategories();
        handleCloseModals();
    };

    return (
        <div className="min-h-screen bg-[#fdf8f6]">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Title and Stats */}
                        <div className="space-y-3">
                            <h1
                                className="text-3xl font-bold font-heading"
                                style={{ color: primaryColor }}
                            >
                                Manage Categories
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-2">
                                    <BookOpen size={16} className="text-blue-500" />
                                    {categoryCounts.book || 0} Books
                                </span>
                                <span className="flex items-center gap-2">
                                    <Pen size={16} className="text-emerald-500" />
                                    {categoryCounts.stationary || 0} Stationery
                                </span>
                                <span className="flex items-center gap-2">
                                    <Flower2 size={16} className="text-pink-500" />
                                    {categoryCounts.flower || 0} Flowers
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="font-medium">{subcategories.length} Total</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => setShowFormModal(true)}
                            className="flex items-center gap-2 text-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                            style={{ backgroundColor: primaryColor }}
                            onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                        >
                            <Plus size={20} />
                            Add Category
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-gray-700"
                            style={{
                                '--tw-ring-color': primaryColor
                            } as React.CSSProperties}
                            onFocus={(e) => (e.target as HTMLElement).style.borderColor = primaryColor}
                            onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#d1d5db'}
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex items-center gap-3">
                        <Filter size={18} className="text-gray-500" />
                        <div className="flex rounded-lg border border-gray-200 bg-white">
                            {(['all', 'book', 'stationary', 'flower'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${filterType === type
                                            ? 'text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                        } ${type === 'all' ? 'rounded-l-lg' : ''} ${type === 'flower' ? 'rounded-r-lg' : ''}`}
                                    style={{
                                        backgroundColor: filterType === type ? primaryColor : 'transparent'
                                    }}
                                >
                                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex rounded-lg border border-gray-200 bg-white">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 transition-all duration-200 rounded-l-lg ${viewMode === 'grid'
                                    ? 'text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            style={{
                                backgroundColor: viewMode === 'grid' ? primaryColor : 'transparent'
                            }}
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 transition-all duration-200 rounded-r-lg ${viewMode === 'list'
                                    ? 'text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            style={{
                                backgroundColor: viewMode === 'list' ? primaryColor : 'transparent'
                            }}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col justify-center items-center py-20">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 mb-4"
                            style={{
                                borderColor: accentColor,
                                borderTopColor: primaryColor
                            }}
                        ></div>
                        <p className="text-gray-500 font-medium">Loading categories...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0"></div>
                        <div>
                            <p className="font-medium">Error loading categories</p>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredCategories.length === 0 && subcategories.length === 0 && (
                    <div className="text-center py-20">
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ backgroundColor: accentColor }}
                        >
                            <BookOpen size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No categories yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Get started by creating your first category. You can organize books, stationery, and flowers.
                        </p>
                        <button
                            onClick={() => setShowFormModal(true)}
                            className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg transition-all duration-200"
                            style={{ backgroundColor: primaryColor }}
                            onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                        >
                            <Plus size={20} />
                            Create First Category
                        </button>
                    </div>
                )}

                {/* No Search Results */}
                {!loading && filteredCategories.length === 0 && subcategories.length > 0 && (
                    <div className="text-center py-16">
                        <Search size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No categories found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                )}

                {/* Categories Grid/List */}
                {!loading && filteredCategories.length > 0 && (
                    <div className={
                        viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            : "space-y-4"
                    }>
                        {filteredCategories.map((cat) => {
                            const typeStyles = getTypeStyles(cat.type);

                            if (viewMode === 'list') {
                                return (
                                    <div
                                        key={cat._id}
                                        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-6">
                                            {cat.image && (
                                                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                                                    <Image
                                                        src={cat.image}
                                                        alt={cat.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900 text-lg truncate">{cat.name}</h3>
                                                    <span className={`${typeStyles.badge} border px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5`}>
                                                        {getTypeIcon(cat.type)}
                                                        {cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm line-clamp-2">{cat.description}</p>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleEditClick(cat)}
                                                    className="border px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                                    style={{
                                                        borderColor: primaryColor,
                                                        color: primaryColor
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        (e.target as HTMLElement).style.backgroundColor = primaryColor;
                                                        (e.target as HTMLElement).style.color = 'white';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                                        (e.target as HTMLElement).style.color = primaryColor;
                                                    }}
                                                >
                                                    <Pencil size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(cat)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={cat._id}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                                >
                                    {cat.image && (
                                        <div className="relative w-full h-48 overflow-hidden">
                                            <Image
                                                src={cat.image}
                                                alt={cat.name}
                                                fill
                                                className="object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-semibold text-gray-900 text-lg leading-tight">{cat.name}</h3>
                                            <span className={`${typeStyles.badge} border px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 flex-shrink-0`}>
                                                {getTypeIcon(cat.type)}
                                                {cat.type}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{cat.description}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditClick(cat)}
                                                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border"
                                                style={{
                                                    borderColor: primaryColor,
                                                    color: primaryColor
                                                }}
                                                onMouseEnter={(e) => {
                                                    (e.target as HTMLElement).style.backgroundColor = primaryColor;
                                                    (e.target as HTMLElement).style.color = 'white';
                                                }}
                                                onMouseLeave={(e) => {
                                                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                                    (e.target as HTMLElement).style.color = primaryColor;
                                                }}
                                            >
                                                <Pencil size={16} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(cat)}
                                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showFormModal && (
                <SubcategoryFormModal
                    onClose={handleCloseModals}
                    onCategoryAdded={fetchSubcategories}
                    initialData={editData || undefined}
                />
            )}

            {showDeleteModal && categoryToDelete && (
                <DeleteConfirmCatModal
                    categoryId={categoryToDelete._id}
                    categoryName={categoryToDelete.name}
                    type={categoryToDelete.type}
                    onClose={handleCloseModals}
                    onDeleted={handleCategoryDeleted}
                />
            )}
        </div>
    );
}
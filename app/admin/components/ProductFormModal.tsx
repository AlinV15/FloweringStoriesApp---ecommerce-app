'use client';

import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '@/app/stores/ProductStore';


interface Props {
    mode: 'create' | 'edit';
    initialData?: any;
    onClose: () => void;
}

const ProductFormModal = ({ mode, initialData, onClose }: Props) => {
    const isEdit = mode === 'edit';
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        price: '',
        stock: '',
        type: '',
        description: '',
        image: '',
    });

    const [bookFields, setBookFields] = useState({
        author: '',
        pages: '',
        isbn: '',
        publisher: '',
        genre: '',
        language: '',
        publicationDate: '',
    });

    const [flowerFields, setFlowerFields] = useState({
        color: '',
        freshness: '',
        lifespan: '',
        season: '',
        careInstructions: '',
        expiryDate: '',
    });

    const [stationaryFields, setStationaryFields] = useState({
        brand: '',
        type: '',
        material: '',
        color: '',
        dimensions: {
            height: '',
            width: '',
            depth: '',
        },
    });

    const { setProducts } = useProductStore();
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

    // Initialize form data when editing
    useEffect(() => {
        if (isEdit && initialData) {
            setForm({
                name: initialData.name || '',
                price: initialData.price?.toString() || '',
                stock: initialData.stock?.toString() || '',
                type: initialData.type || '',
                description: initialData.description || '',
                image: initialData.image || '',
            });

            // Populate specific fields based on product type
            if (initialData.type === 'book' && initialData.refData) {
                setBookFields({
                    author: initialData.refData.author || '',
                    pages: initialData.refData.pages?.toString() || '',
                    isbn: initialData.refData.isbn || '',
                    publisher: initialData.refData.publisher || '',
                    genre: initialData.refData.genre || '',
                    language: initialData.refData.language || '',
                    publicationDate: initialData.refData.publicationDate || '',
                });
            } else if (initialData.type === 'flower' && initialData.refData) {
                setFlowerFields({
                    color: initialData.refData.color || '',
                    freshness: initialData.refData.freshness?.toString() || '',
                    lifespan: initialData.refData.lifespan?.toString() || '',
                    season: initialData.refData.season || '',
                    careInstructions: initialData.refData.careInstructions || '',
                    expiryDate: initialData.refData.expiryDate || '',
                });
            } else if (initialData.type === 'stationary' && initialData.refData) {
                setStationaryFields({
                    brand: initialData.refData.brand || '',
                    type: initialData.refData.type || '',
                    material: initialData.refData.material || '',
                    color: Array.isArray(initialData.refData.color) ? initialData.refData.color.join(', ') : '',
                    dimensions: {
                        height: initialData.refData.dimensions?.height?.toString() || '',
                        width: initialData.refData.dimensions?.width?.toString() || '',
                        depth: initialData.refData.dimensions?.depth?.toString() || '',
                    },
                });
            }
        }
    }, [isEdit, initialData]);

    // Basic validation before submission
    const validateForm = () => {
        // Common validation
        if (!form.name || !form.price || !form.stock || !form.type || !form.image) {
            toast.error('Complete all required fields');
            return false;
        }

        const imageUrlPattern = /^https?:\/\//;
        if (form.image && !imageUrlPattern.test(form.image)) {
            toast.error('Invalid image URL');
            return false;
        }


        // Type-specific validation
        switch (form.type) {
            case 'book':
                if (!bookFields.author || !bookFields.isbn || !bookFields.pages) {
                    toast.error('Complete all required fields for book');
                    return false;
                }
                if (bookFields.isbn.length !== 13) {
                    toast.error('ISBN must be 13 characters long');
                    return false;
                }
                break;

            case 'flower':
                if (!flowerFields.color || !flowerFields.freshness || !flowerFields.lifespan) {
                    toast.error('Complete all required fields for flower');
                    return false;
                }
                if (parseFloat(flowerFields.freshness) < 0 || parseFloat(flowerFields.freshness) > 100) {
                    toast.error('Freshness must be between 0 and 100');
                    return false;
                }
                break;

            case 'stationary':
                if (!stationaryFields.color || !stationaryFields.type ||
                    !stationaryFields.dimensions.height ||
                    !stationaryFields.dimensions.width ||
                    !stationaryFields.dimensions.depth) {
                    toast.error('Complete all required fields for stationary');
                    return false;
                }
                break;

            default:
                toast.error('Product type is not valid');
                return false;
        }

        return true;
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        // Specific validations
        const newErrors: { [key: string]: boolean } = {};
        if (!form.name) newErrors.name = true;
        if (!form.price) newErrors.price = true;
        if (!form.stock) newErrors.stock = true;
        if (!form.type) newErrors.type = true;
        if (!form.image) newErrors.image = true;

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        setIsLoading(true);
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            setForm({ ...form, image: data.secure_url });
            toast.success('Image uploaded successfully');
        } catch (err) {
            toast.error('Image upload failed');
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // console.log("Form opened"); 
        //validateForm();

        if (!validateForm()) validateForm();

        setIsLoading(true);

        const typeRef = form.type.charAt(0).toUpperCase() + form.type.slice(1);
        const productData = {
            ...form,
            typeRef,
            price: parseFloat(form.price),
            stock: parseInt(form.stock),
        };

        let refData = {};
        let endpoint = '';

        switch (form.type) {
            case 'book':
                refData = {
                    book: {
                        author: bookFields.author,
                        pages: parseInt(bookFields.pages),
                        isbn: bookFields.isbn,
                        publisher: bookFields.publisher || undefined,
                        genre: bookFields.genre || undefined,
                        language: bookFields.language || undefined,
                        publicationDate: bookFields.publicationDate || undefined,
                    },
                    product: productData,
                };
                endpoint = isEdit ? `/api/product/book/${initialData.refId}` : '/api/product/book';
                break;
            case 'flower':
                refData = {
                    flower: {
                        color: flowerFields.color,
                        freshness: parseFloat(flowerFields.freshness),
                        lifespan: parseInt(flowerFields.lifespan),
                        season: flowerFields.season || undefined,
                        careInstructions: flowerFields.careInstructions || undefined,
                        expiryDate: flowerFields.expiryDate || undefined,
                    },
                    product: productData,
                };
                endpoint = isEdit ? `/api/product/flower/${initialData.refId}` : '/api/product/flower';
                break;
            case 'stationary':
                refData = {
                    stationary: {
                        brand: stationaryFields.brand || undefined,
                        color: stationaryFields.color.split(',').map((c) => c.trim()),
                        type: stationaryFields.type,
                        price: productData.price,
                        dimensions: {
                            height: parseFloat(stationaryFields.dimensions.height),
                            width: parseFloat(stationaryFields.dimensions.width),
                            depth: parseFloat(stationaryFields.dimensions.depth),
                        },
                        material: stationaryFields.material || undefined,
                    },
                    product: productData,
                };
                endpoint = isEdit ? `/api/product/stationary/${initialData.refId}` : '/api/product/stationary';
                break;
        }

        try {
            const res = await fetch(endpoint, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(refData),
            });

            const result = await res.json();

            if (!res.ok) {
                const errorDetails = result.errors ? JSON.stringify(result.errors, null, 2) : result.message;
                toast.error(`Eroare: ${errorDetails}`);
                setIsLoading(false);
                return;
            }

            toast.success(`Produs ${isEdit ? 'actualizat' : 'creat'} cu succes!`);
            const updated = await fetch('/api/product');

            const data = await updated.json();
            setProducts(data.products);
            onClose();
        } catch (err: any) {
            toast.error('Eroare de rețea sau server!');
            setIsLoading(false);
        }
    };

    const inputClasses = (field: string) => `
    w-full border ${errors[field] ? 'border-red-500' : 'border-gray-300'}
    p-3 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30
    ${errors[field] ? 'focus:border-red-500' : 'focus:border-[#9c6b63]'}
    text-sm outline-none transition duration-200
  `;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white pb-4 flex justify-between items-center border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEdit ? 'Edit product' : 'Add new product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4 text-neutral-600">
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-700">General info</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    name="name"
                                    placeholder="Product name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product type *</label>
                                <select
                                    name="type"
                                    value={form.type}
                                    disabled={isEdit}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none disabled:bg-gray-100 disabled:text-gray-500"

                                >
                                    <option value="">Choose a type</option>
                                    <option value="book">Book</option>
                                    <option value="flower">Flower</option>
                                    <option value="stationary">Stationary</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                                <input
                                    name="price"
                                    placeholder="Price"
                                    type="number"
                                    step="0.01"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                                <input
                                    name="stock"
                                    placeholder="Avaible stock"
                                    type="number"
                                    value={form.stock}
                                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-500 mb-1">Product Image *</label>
                            <div className="relative group border-2 border-dashed border-neutral-300 rounded-lg p-4 bg-neutral-50 hover:bg-neutral-100 transition">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                {form.image ? (
                                    <div className="w-full h-48 overflow-hidden rounded-md">
                                        <img
                                            src={form.image}
                                            alt="Uploaded preview"
                                            className="w-full h-full object-cover object-center transition group-hover:scale-105"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center text-xs py-1">
                                            Click to change image
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-32 text-neutral-400">
                                        <Upload size={24} className="mb-1" />
                                        <p className="text-sm">Click to upload product image</p>
                                    </div>
                                )}
                            </div>
                            {form.image && (
                                <img src={form.image} alt="Preview" className="mt-2 h-32 object-contain rounded border" />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                placeholder="Product description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                            />
                        </div>
                    </div>

                    {form.type && (
                        <div className="pt-2 border-t border-gray-200">
                            <h3 className="font-medium text-gray-700 mb-4">
                                {form.type === 'book' && 'Book details'}
                                {form.type === 'flower' && 'Flower details'}
                                {form.type === 'stationary' && 'Stationary details'}
                            </h3>

                            {form.type === 'book' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                                            <input
                                                placeholder="Author"
                                                value={bookFields.author}
                                                onChange={(e) => setBookFields({ ...bookFields, author: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
                                            <input
                                                placeholder="ISBN (13 caractere)"
                                                value={bookFields.isbn}
                                                onChange={(e) => setBookFields({ ...bookFields, isbn: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pages *</label>
                                            <input
                                                placeholder="Pages no."
                                                type="number"
                                                value={bookFields.pages}
                                                onChange={(e) => setBookFields({ ...bookFields, pages: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                                            <input
                                                placeholder="Publisher"
                                                value={bookFields.publisher}
                                                onChange={(e) => setBookFields({ ...bookFields, publisher: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                                            <input
                                                placeholder="Genre"
                                                value={bookFields.genre}
                                                onChange={(e) => setBookFields({ ...bookFields, genre: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                            <input
                                                placeholder="Language"
                                                value={bookFields.language}
                                                onChange={(e) => setBookFields({ ...bookFields, language: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Publication date</label>
                                        <input
                                            type="date"
                                            placeholder="Publication date"
                                            value={bookFields.publicationDate}
                                            onChange={(e) => setBookFields({ ...bookFields, publicationDate: e.target.value })}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {form.type === 'flower' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                                            <input
                                                placeholder="Color"
                                                value={flowerFields.color}
                                                onChange={(e) => setFlowerFields({ ...flowerFields, color: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                                            <select
                                                value={flowerFields.season}
                                                onChange={(e) => setFlowerFields({ ...flowerFields, season: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                                            >
                                                <option value="">Select a season</option>
                                                <option value="spring">Spring</option>
                                                <option value="summer">Summer</option>
                                                <option value="autumn">Autumn</option>
                                                <option value="winter">Winter</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Freshness (0-100) *</label>
                                            <input
                                                placeholder="Freshness"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={flowerFields.freshness}
                                                onChange={(e) => setFlowerFields({ ...flowerFields, freshness: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Lifespan (days) *</label>
                                            <input
                                                placeholder="Lifespan (days)"
                                                type="number"
                                                min="1"
                                                value={flowerFields.lifespan}
                                                onChange={(e) => setFlowerFields({ ...flowerFields, lifespan: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Care instructions</label>
                                        <textarea
                                            placeholder="Care instructions"
                                            value={flowerFields.careInstructions}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, careInstructions: e.target.value })}
                                            rows={3}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expire date</label>
                                        <input
                                            type="date"
                                            placeholder="Expire date"
                                            value={flowerFields.expiryDate}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, expiryDate: e.target.value })}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {form.type === 'stationary' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                            <input
                                                placeholder="Brand"
                                                value={stationaryFields.brand}
                                                onChange={(e) => setStationaryFields({ ...stationaryFields, brand: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                            <input
                                                placeholder="Type"
                                                value={stationaryFields.type}
                                                onChange={(e) => setStationaryFields({ ...stationaryFields, type: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Colors * (eg: red, blue)</label>
                                            <input
                                                placeholder="Color (separate with commas )"
                                                value={stationaryFields.color}
                                                onChange={(e) => setStationaryFields({ ...stationaryFields, color: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                                            <input
                                                placeholder="Material"
                                                value={stationaryFields.material}
                                                onChange={(e) => setStationaryFields({ ...stationaryFields, material: e.target.value })}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (cm) *</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <input
                                                    placeholder="Height"
                                                    type="number"

                                                    step="0.1"
                                                    value={stationaryFields.dimensions.height}
                                                    onChange={(e) => setStationaryFields({
                                                        ...stationaryFields,
                                                        dimensions: {
                                                            ...stationaryFields.dimensions,
                                                            height: e.target.value
                                                        }
                                                    })}
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                                />
                                                <span className="text-xs text-gray-500 mt-1 block">Height</span>
                                            </div>
                                            <div>
                                                <input
                                                    placeholder="Width"
                                                    type="number"

                                                    step="0.1"
                                                    value={stationaryFields.dimensions.width}
                                                    onChange={(e) => setStationaryFields({
                                                        ...stationaryFields,
                                                        dimensions: {
                                                            ...stationaryFields.dimensions,
                                                            width: e.target.value
                                                        }
                                                    })}
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                                />
                                                <span className="text-xs text-gray-500 mt-1 block">Width</span>
                                            </div>
                                            <div>
                                                <input
                                                    placeholder="Depth"
                                                    type="number"

                                                    step="0.1"
                                                    value={stationaryFields.dimensions.depth}
                                                    onChange={(e) => setStationaryFields({
                                                        ...stationaryFields,
                                                        dimensions: {
                                                            ...stationaryFields.dimensions,
                                                            depth: e.target.value
                                                        }
                                                    })}
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"

                                                />
                                                <span className="text-xs text-gray-500 mt-1 block">Depth</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#9c6b63] hover:bg-[#8a5b53] rounded-lg text-white transition-colors flex items-center justify-center"
                            disabled={isLoading}

                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : null}
                            {isEdit ? 'Save' : 'Add product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
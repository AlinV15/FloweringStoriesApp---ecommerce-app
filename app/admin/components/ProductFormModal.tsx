'use client';

import { useEffect, useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '@/app/stores/ProductStore';

// Define types for better type safety
type ProductType = 'book' | 'flower' | 'stationary' | '';
type FormMode = 'create' | 'edit';

interface ProductFormData {
    name: string;
    price: string;
    stock: string;
    type: ProductType;
    description: string;
    image: string;
}

interface BookFields {
    author: string;
    pages: string;
    isbn: string;
    publisher: string;
    genre: string;
    language: string;
    publicationDate: string;
}

interface FlowerFields {
    color: string;
    freshness: string;
    lifespan: string;
    season: string;
    careInstructions: string;
    expiryDate: string;
}

interface StationaryFields {
    brand: string;
    type: string;
    material: string;
    color: string;
    dimensions: {
        height: string;
        width: string;
        depth: string;
    };
}

interface Props {
    mode: FormMode;
    initialData?: any;
    onClose: () => void;
}

const ProductFormModal = ({ mode, initialData, onClose }: Props) => {
    const isEdit = mode === 'edit';
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<ProductFormData>({
        name: '',
        price: '',
        stock: '',
        type: '',
        description: '',
        image: '',
    });

    const [bookFields, setBookFields] = useState<BookFields>({
        author: '',
        pages: '',
        isbn: '',
        publisher: '',
        genre: '',
        language: '',
        publicationDate: '',
    });

    const [flowerFields, setFlowerFields] = useState<FlowerFields>({
        color: '',
        freshness: '',
        lifespan: '',
        season: '',
        careInstructions: '',
        expiryDate: '',
    });

    const [stationaryFields, setStationaryFields] = useState<StationaryFields>({
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
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Initialize form data when editing
    useEffect(() => {
        if (isEdit && initialData) {
            setForm({
                name: initialData.name || '',
                price: initialData.price?.toString() || '',
                stock: initialData.stock?.toString() || '',
                type: (initialData.type as ProductType) || '',
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
                    color: Array.isArray(initialData.refData.color)
                        ? initialData.refData.color.join(', ')
                        : initialData.refData.color || '',
                    dimensions: {
                        height: initialData.refData.dimensions?.height?.toString() || '',
                        width: initialData.refData.dimensions?.width?.toString() || '',
                        depth: initialData.refData.dimensions?.depth?.toString() || '',
                    },
                });
            }
        }
    }, [isEdit, initialData]);

    // Improved validation function
    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        // Common validation
        if (!form.name) newErrors.name = 'Name is required';
        if (!form.price) newErrors.price = 'Price is required';
        else if (parseFloat(form.price) <= 0) newErrors.price = 'Price must be greater than 0';

        if (!form.stock) newErrors.stock = 'Stock is required';
        else if (parseInt(form.stock) < 0) newErrors.stock = 'Stock cannot be negative';

        if (!form.type) newErrors.type = 'Product type is required';
        if (!form.image) newErrors.image = 'Product image is required';

        const imageUrlPattern = /^https?:\/\//;
        if (form.image && !imageUrlPattern.test(form.image)) {
            newErrors.image = 'Invalid image URL';
        }

        // Type-specific validation
        switch (form.type) {
            case 'book':
                if (!bookFields.author) newErrors.author = 'Author is required';
                if (!bookFields.isbn) newErrors.isbn = 'ISBN is required';
                else if (bookFields.isbn.length !== 13) newErrors.isbn = 'ISBN must be 13 characters';

                if (!bookFields.pages) newErrors.pages = 'Number of pages is required';
                else if (parseInt(bookFields.pages) <= 0) newErrors.pages = 'Pages must be greater than 0';
                break;

            case 'flower':
                if (!flowerFields.color) newErrors.flowerColor = 'Color is required';

                if (!flowerFields.freshness) newErrors.freshness = 'Freshness is required';
                else if (parseFloat(flowerFields.freshness) < 0 || parseFloat(flowerFields.freshness) > 100) {
                    newErrors.freshness = 'Freshness must be between 0 and 100';
                }

                if (!flowerFields.lifespan) newErrors.lifespan = 'Lifespan is required';
                else if (parseInt(flowerFields.lifespan) <= 0) newErrors.lifespan = 'Lifespan must be greater than 0';
                break;

            case 'stationary':
                if (!stationaryFields.type) newErrors.stationaryType = 'Type is required';
                if (!stationaryFields.color) newErrors.stationaryColor = 'Color is required';

                const { height, width, depth } = stationaryFields.dimensions;
                if (!height) newErrors.height = 'Height is required';
                if (!width) newErrors.width = 'Width is required';
                if (!depth) newErrors.depth = 'Depth is required';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form, bookFields, flowerFields, stationaryFields]);

    // Set field as touched when user interacts with it
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    useEffect(() => {
        // Validate only fields that have been touched
        if (Object.keys(touched).length > 0) {
            validateForm();
        }
    }, [form, bookFields, flowerFields, stationaryFields, touched, validateForm]);

    // Improved image upload with error handling
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        setIsLoading(true);
        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const data = await res.json();
            setForm({ ...form, image: data.secure_url });
            setTouched(prev => ({ ...prev, image: true }));
            toast.success('Image uploaded successfully');
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Image upload failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Full validation on submit
        if (!validateForm()) {
            // Mark all fields as touched to show errors
            const allFields = [
                'name', 'price', 'stock', 'type', 'image',
                'author', 'isbn', 'pages',
                'flowerColor', 'freshness', 'lifespan',
                'stationaryType', 'stationaryColor', 'height', 'width', 'depth'
            ];

            const newTouched: Record<string, boolean> = {};
            allFields.forEach(field => {
                newTouched[field] = true;
            });

            setTouched(newTouched);
            toast.error('Please fix the errors in the form');
            return;
        }

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
                toast.error(`Error: ${errorDetails}`);
                setIsLoading(false);
                return;
            }

            toast.success(`Product ${isEdit ? 'updated' : 'created'} successfully!`);

            // Refresh products list
            try {
                const updated = await fetch('/api/product');
                const data = await updated.json();
                setProducts(data.products);
                onClose();
            } catch (fetchError) {
                console.error('Error fetching updated products:', fetchError);
                toast.error('Product was saved but there was an error refreshing the product list');
                onClose();
            }
        } catch (err: any) {
            console.error('Submission error:', err);
            toast.error('Network or server error. Please try again.');
            setIsLoading(false);
        }
    };

    // Helper function for field classes based on error state
    const getInputClasses = (fieldName: string) => {
        const hasError = touched[fieldName] && errors[fieldName];

        return `w-full border ${hasError ? 'border-red-500' : 'border-gray-300'
            } p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 ${hasError ? 'focus:border-red-500' : 'focus:border-[#9c6b63]'
            } outline-none transition duration-200`;
    };

    // Reusable form field component
    const FormField = ({
        label,
        name,
        placeholder,
        value,
        onChange,
        type = 'text',
        required = false,
        min,
        max,
        step,
        disabled = false
    }: {
        label: string;
        name: string;
        placeholder: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        type?: string;
        required?: boolean;
        min?: string | number;
        max?: string | number;
        step?: string;
        disabled?: boolean;
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                name={name}
                placeholder={placeholder}
                type={type}
                value={value}
                onChange={onChange}
                onBlur={() => handleBlur(name)}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className={getInputClasses(name)}
            />
            {touched[name] && errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
        </div>
    );

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
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4 text-neutral-600">
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-700">General info</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Name"
                                name="name"
                                placeholder="Product name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={form.type}
                                    disabled={isEdit}
                                    onChange={(e) => setForm({ ...form, type: e.target.value as ProductType })}
                                    onBlur={() => handleBlur('type')}
                                    className={`${getInputClasses('type')} ${isEdit ? 'bg-gray-100 text-gray-500' : ''}`}
                                >
                                    <option value="">Choose a type</option>
                                    <option value="book">Book</option>
                                    <option value="flower">Flower</option>
                                    <option value="stationary">Stationary</option>
                                </select>
                                {touched.type && errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Price ($)"
                                name="price"
                                placeholder="Price"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                            />

                            <FormField
                                label="Stock"
                                name="stock"
                                placeholder="Available stock"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                type="number"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Image <span className="text-red-500">*</span>
                            </label>
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
                            {touched.image && errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                placeholder="Product description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                onBlur={() => handleBlur('description')}
                                rows={3}
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                            />
                        </div>
                    </div>

                    {/* This is just the first part of the improved component. 
              Type-specific fields will be in Part 2 */}
                    {/* Type-specific fields */}
                    {form.type && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="font-medium text-gray-700 mb-4">
                                {form.type === 'book' ? 'Book details' :
                                    form.type === 'flower' ? 'Flower details' :
                                        form.type === 'stationary' ? 'Stationary details' : ''}
                            </h3>

                            {/* Book-specific fields */}
                            {form.type === 'book' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            label="Author"
                                            name="author"
                                            placeholder="Book author"
                                            value={bookFields.author}
                                            onChange={(e) => setBookFields({ ...bookFields, author: e.target.value })}
                                            required
                                        />

                                        <FormField
                                            label="ISBN"
                                            name="isbn"
                                            placeholder="13-digit ISBN"
                                            value={bookFields.isbn}
                                            onChange={(e) => setBookFields({ ...bookFields, isbn: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            label="Pages"
                                            name="pages"
                                            placeholder="Number of pages"
                                            value={bookFields.pages}
                                            onChange={(e) => setBookFields({ ...bookFields, pages: e.target.value })}
                                            type="number"
                                            min="1"
                                            required
                                        />

                                        <FormField
                                            label="Publisher"
                                            name="publisher"
                                            placeholder="Publisher name"
                                            value={bookFields.publisher}
                                            onChange={(e) => setBookFields({ ...bookFields, publisher: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            label="Genre"
                                            name="genre"
                                            placeholder="Book genre"
                                            value={bookFields.genre}
                                            onChange={(e) => setBookFields({ ...bookFields, genre: e.target.value })}
                                        />

                                        <FormField
                                            label="Language"
                                            name="language"
                                            placeholder="Book language"
                                            value={bookFields.language}
                                            onChange={(e) => setBookFields({ ...bookFields, language: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <FormField
                                            label="Publication Date"
                                            name="publicationDate"
                                            placeholder="YYYY-MM-DD"
                                            value={bookFields.publicationDate}
                                            onChange={(e) => setBookFields({ ...bookFields, publicationDate: e.target.value })}
                                            type="date"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Flower-specific fields */}
                            {form.type === 'flower' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            label="Color"
                                            name="flowerColor"
                                            placeholder="Flower color"
                                            value={flowerFields.color}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, color: e.target.value })}
                                            required
                                        />

                                        <FormField
                                            label="Season"
                                            name="season"
                                            placeholder="Blooming season"
                                            value={flowerFields.season}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, season: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            label="Freshness (%)"
                                            name="freshness"
                                            placeholder="Current freshness"
                                            value={flowerFields.freshness}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, freshness: e.target.value })}
                                            type="number"
                                            min="0"
                                            max="100"
                                            required
                                        />

                                        <FormField
                                            label="Lifespan (days)"
                                            name="lifespan"
                                            placeholder="Expected lifespan"
                                            value={flowerFields.lifespan}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, lifespan: e.target.value })}
                                            type="number"
                                            min="1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Care Instructions
                                        </label>
                                        <textarea
                                            name="careInstructions"
                                            placeholder="Care instructions for the flower"
                                            value={flowerFields.careInstructions}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, careInstructions: e.target.value })}
                                            onBlur={() => handleBlur('careInstructions')}
                                            rows={3}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <FormField
                                            label="Expiry Date"
                                            name="expiryDate"
                                            placeholder="YYYY-MM-DD"
                                            value={flowerFields.expiryDate}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, expiryDate: e.target.value })}
                                            type="date"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Stationary-specific fields */}
                            {form.type === 'stationary' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            label="Type"
                                            name="stationaryType"
                                            placeholder="Stationary type (e.g., pen, notebook)"
                                            value={stationaryFields.type}
                                            onChange={(e) => setStationaryFields({ ...stationaryFields, type: e.target.value })}
                                            required
                                        />

                                        <FormField
                                            label="Brand"
                                            name="brand"
                                            placeholder="Brand name"
                                            value={stationaryFields.brand}
                                            onChange={(e) => setStationaryFields({ ...stationaryFields, brand: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            label="Color(s)"
                                            name="stationaryColor"
                                            placeholder="Color(s), comma separated"
                                            value={stationaryFields.color}
                                            onChange={(e) => setStationaryFields({ ...stationaryFields, color: e.target.value })}
                                            required
                                        />

                                        <FormField
                                            label="Material"
                                            name="material"
                                            placeholder="Primary material"
                                            value={stationaryFields.material}
                                            onChange={(e) => setStationaryFields({ ...stationaryFields, material: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dimensions <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <input
                                                    name="height"
                                                    placeholder="Height (cm)"
                                                    type="number"
                                                    min="0.1"
                                                    step="0.1"
                                                    value={stationaryFields.dimensions.height}
                                                    onChange={(e) => setStationaryFields({
                                                        ...stationaryFields,
                                                        dimensions: {
                                                            ...stationaryFields.dimensions,
                                                            height: e.target.value
                                                        }
                                                    })}
                                                    onBlur={() => handleBlur('height')}
                                                    className={getInputClasses('height')}
                                                />
                                                {touched.height && errors.height && (
                                                    <p className="text-xs text-red-500 mt-1">{errors.height}</p>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    name="width"
                                                    placeholder="Width (cm)"
                                                    type="number"
                                                    min="0.1"
                                                    step="0.1"
                                                    value={stationaryFields.dimensions.width}
                                                    onChange={(e) => setStationaryFields({
                                                        ...stationaryFields,
                                                        dimensions: {
                                                            ...stationaryFields.dimensions,
                                                            width: e.target.value
                                                        }
                                                    })}
                                                    onBlur={() => handleBlur('width')}
                                                    className={getInputClasses('width')}
                                                />
                                                {touched.width && errors.width && (
                                                    <p className="text-xs text-red-500 mt-1">{errors.width}</p>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    name="depth"
                                                    placeholder="Depth (cm)"
                                                    type="number"
                                                    min="0.1"
                                                    step="0.1"
                                                    value={stationaryFields.dimensions.depth}
                                                    onChange={(e) => setStationaryFields({
                                                        ...stationaryFields,
                                                        dimensions: {
                                                            ...stationaryFields.dimensions,
                                                            depth: e.target.value
                                                        }
                                                    })}
                                                    onBlur={() => handleBlur('depth')}
                                                    className={getInputClasses('depth')}
                                                />
                                                {touched.depth && errors.depth && (
                                                    <p className="text-xs text-red-500 mt-1">{errors.depth}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-5 border-t border-gray-200 mt-6">
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9c6b63]"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-[#9c6b63] border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#865a53] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9c6b63] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isEdit ? 'Updating...' : 'Creating...'}
                                    </span>
                                ) : isEdit ? 'Update Product' : 'Create Product'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
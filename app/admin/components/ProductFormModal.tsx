'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '@/app/stores/ProductStore';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import ChevronUpDownIcon from '@heroicons/react/20/solid/ChevronUpDownIcon';

// Define types for better type safety
type ProductType = 'book' | 'flower' | 'stationary' | '';
type FormMode = 'create' | 'edit';

interface ProductFormData {
    name: string;
    price: string;
    stock: string;
    discount?: string;
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
    const [isInitializing, setIsInitializing] = useState(isEdit);
    const [form, setForm] = useState<ProductFormData>({
        name: '',
        price: '',
        stock: '',
        type: '',
        discount: '',
        description: '',
        image: '',
    });
    const fetchProducts = useProductStore((state) => state.fetchProducts);

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

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const placeholder = 'Select an option';

    const options = [
        { value: 'book', label: 'Book' },
        { value: 'flower', label: 'Flower' },
        { value: 'stationary', label: 'Stationary' },
    ];

    // Function to format date for input field
    const formatDateForInput = (dateString: string | Date | undefined) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    // Fetch product-specific data and populate form
    const populateData = async () => {
        if (!isEdit || !initialData) return;

        setIsInitializing(true);
        try {
            let res;
            let typeData = null;

            console.log('Fetching initial data for product:', initialData.refId);

            // Fetch type-specific data
            switch (initialData?.type) {
                case 'book':
                    res = await fetch(`/api/product/book/${initialData?.refId}`);
                    break;
                case 'flower':
                    res = await fetch(`/api/product/flower/${initialData?.refId}`);
                    break;
                case 'stationary':
                    res = await fetch(`/api/product/stationary/${initialData?.refId}`);
                    break;
                default:
                    throw new Error('Invalid product type');
            }

            if (res && res.ok) {
                typeData = await res.json();
                console.log('Fetched type data:', typeData);
            }

            // Populate main form fields
            setForm({
                name: initialData.name || '',
                price: initialData.price?.toString() || '',
                stock: initialData.stock?.toString() || '',
                type: (initialData.type as ProductType) || '',
                description: initialData.description || '',
                image: initialData.image || '',
                discount: initialData.discount?.toString() || '',
            });

            // Populate type-specific fields with fetched data
            if (typeData) {
                switch (initialData.type) {
                    case 'book':
                        setBookFields({
                            author: typeData.author || '',
                            pages: typeData.pages?.toString() || '',
                            isbn: typeData.isbn || '',
                            publisher: typeData.publisher || '',
                            genre: typeData.genre || '',
                            language: typeData.language || '',
                            publicationDate: formatDateForInput(typeData.publicationDate),
                        });
                        break;

                    case 'flower':
                        setFlowerFields({
                            color: typeData.color || '',
                            freshness: typeData.freshness?.toString() || '',
                            lifespan: typeData.lifespan?.toString() || '',
                            season: typeData.season || '',
                            careInstructions: typeData.careInstructions || '',
                            expiryDate: formatDateForInput(typeData.expiryDate),
                        });
                        break;

                    case 'stationary':
                        setStationaryFields({
                            brand: typeData.brand || '',
                            type: typeData.type || '',
                            material: typeData.material || '',
                            color: Array.isArray(typeData.color)
                                ? typeData.color.join(', ')
                                : typeData.color || '',
                            dimensions: {
                                height: typeData.dimensions?.height?.toString() || '',
                                width: typeData.dimensions?.width?.toString() || '',
                                depth: typeData.dimensions?.depth?.toString() || '',
                            },
                        });
                        break;
                }
            }

        } catch (err) {
            console.error('Error fetching product data:', err);
            toast.error('Failed to fetch product details');
        } finally {
            setIsInitializing(false);
        }
    };

    useEffect(() => {
        populateData();
    }, []);

    // Optimized validation function - only validates specific fields when needed
    const validateField = useCallback((fieldName: string, value: string, formData?: any) => {
        const currentForm = formData || form;

        switch (fieldName) {
            case 'name':
                return !value ? 'Name is required' : '';
            case 'price':
                if (!value) return 'Price is required';
                if (parseFloat(value) <= 0) return 'Price must be greater than 0';
                return '';
            case 'stock':
                if (!value) return 'Stock is required';
                if (parseInt(value) < 0) return 'Stock cannot be negative';
                return '';
            case 'type':
                return !value ? 'Product type is required' : '';
            case 'image':
                if (!value) return 'Product image is required';
                const imageUrlPattern = /^https?:\/\//;
                if (!imageUrlPattern.test(value)) return 'Invalid image URL';
                return '';

            // Book fields
            case 'author':
                return currentForm.type === 'book' && !value ? 'Author is required' : '';
            case 'isbn':
                if (currentForm.type === 'book') {
                    if (!value) return 'ISBN is required';
                    if (value.length !== 13) return 'ISBN must be 13 characters';
                }
                return '';
            case 'pages':
                if (currentForm.type === 'book') {
                    if (!value) return 'Number of pages is required';
                    if (parseInt(value) <= 0) return 'Pages must be greater than 0';
                }
                return '';

            // Flower fields
            case 'flowerColor':
                return currentForm.type === 'flower' && !value ? 'Color is required' : '';
            case 'freshness':
                if (currentForm.type === 'flower') {
                    if (!value) return 'Freshness is required';
                    const freshnessVal = parseFloat(value);
                    if (freshnessVal < 0 || freshnessVal > 100) return 'Freshness must be between 0 and 100';
                }
                return '';
            case 'lifespan':
                if (currentForm.type === 'flower') {
                    if (!value) return 'Lifespan is required';
                    if (parseInt(value) <= 0) return 'Lifespan must be greater than 0';
                }
                return '';

            // Stationary fields
            case 'stationaryType':
                return currentForm.type === 'stationary' && !value ? 'Type is required' : '';
            case 'stationaryColor':
                return currentForm.type === 'stationary' && !value ? 'Color is required' : '';
            case 'height':
            case 'width':
            case 'depth':
                return currentForm.type === 'stationary' && !value ? `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required` : '';

            default:
                return '';
        }
    }, [form]);

    // Validate all fields for form submission
    const validateAllFields = useCallback(() => {
        const newErrors: Record<string, string> = {};

        // Common fields
        newErrors.name = validateField('name', form.name);
        newErrors.price = validateField('price', form.price);
        newErrors.stock = validateField('stock', form.stock);
        newErrors.type = validateField('type', form.type);
        newErrors.image = validateField('image', form.image);

        // Type-specific validation
        if (form.type === 'book') {
            newErrors.author = validateField('author', bookFields.author);
            newErrors.isbn = validateField('isbn', bookFields.isbn);
            newErrors.pages = validateField('pages', bookFields.pages);
        } else if (form.type === 'flower') {
            newErrors.flowerColor = validateField('flowerColor', flowerFields.color);
            newErrors.freshness = validateField('freshness', flowerFields.freshness);
            newErrors.lifespan = validateField('lifespan', flowerFields.lifespan);
        } else if (form.type === 'stationary') {
            newErrors.stationaryType = validateField('stationaryType', stationaryFields.type);
            newErrors.stationaryColor = validateField('stationaryColor', stationaryFields.color);
            newErrors.height = validateField('height', stationaryFields.dimensions.height);
            newErrors.width = validateField('width', stationaryFields.dimensions.width);
            newErrors.depth = validateField('depth', stationaryFields.dimensions.depth);
        }

        // Filter out empty errors
        const filteredErrors = Object.fromEntries(
            Object.entries(newErrors).filter(([_, value]) => value !== '')
        );

        setErrors(filteredErrors);
        return Object.keys(filteredErrors).length === 0;
    }, [form, bookFields, flowerFields, stationaryFields, validateField]);

    // Memoized input classes to prevent unnecessary recalculations
    const getInputClasses = useMemo(() => {
        return (fieldName: string) => {
            const hasError = touched[fieldName] && errors[fieldName];
            return `w-full border ${hasError ? 'border-red-500' : 'border-gray-300'} p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 ${hasError ? 'focus:border-red-500' : 'focus:border-[#9c6b63]'} outline-none transition duration-200`;
        };
    }, [touched, errors]);

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
            setForm(prev => ({ ...prev, image: data.secure_url }));
            setTouched(prev => ({ ...prev, image: true }));

            // Validate image field after upload
            const imageError = validateField('image', data.secure_url);
            setErrors(prev => ({ ...prev, image: imageError }));

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
        if (!validateAllFields()) {
            // Mark all relevant fields as touched to show errors
            const allFields = [
                'name', 'price', 'stock', 'type', 'image',
                ...(form.type === 'book' ? ['author', 'isbn', 'pages'] : []),
                ...(form.type === 'flower' ? ['flowerColor', 'freshness', 'lifespan'] : []),
                ...(form.type === 'stationary' ? ['stationaryType', 'stationaryColor', 'height', 'width', 'depth'] : [])
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
            discount: form.discount ? parseFloat(form.discount) : 0,
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
                fetchProducts();
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

    // Optimized form field component with memoization
    const FormField = useMemo(() => {
        return ({
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
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    className={getInputClasses(name)}
                />
                {touched[name] && errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
            </div>
        );
    }, [touched, errors, getInputClasses]);

    // Show loading state while initializing data
    if (isInitializing) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 flex flex-col items-center justify-center h-48">
                    <svg className="animate-spin h-8 w-8 text-[#9c6b63] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Loading product data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white pb-4 flex justify-between items-center border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEdit ? 'Edit product' : 'Add new product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer"
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
                                <Listbox value={form.type}
                                    name="type"
                                    disabled={isEdit}
                                    onChange={(value) => setForm({ ...form, type: value as ProductType })}>
                                    <ListboxButton
                                        className={`${getInputClasses('type')} ${isEdit ? 'bg-gray-100 text-gray-500' : ''} flex justify-center cursor-pointer`}
                                    >
                                        {options.find((o) => o.value === form.type)?.label || placeholder}
                                        <ChevronUpDownIcon className="w-5 h-5  pt-1 text-gray-600 " />
                                    </ListboxButton>

                                    <ListboxOptions
                                        className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border border-gray-300 shadow-md text-sm z-10"
                                    >
                                        {options.map((option) => (
                                            <ListboxOption
                                                key={option.value}
                                                value={option.value}
                                                className={({ active }: { active: boolean }) =>
                                                    `cursor-pointer px-4 py-2 transition-colors duration-100 ${active ? 'bg-[#f5e1dd] text-[#9c6b63]' : 'text-gray-700'
                                                    }`
                                                }
                                            >
                                                {option.label}
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                </Listbox>
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
                        <FormField
                            label="Discount (%)"
                            name="discount"
                            placeholder="Discount percentage"
                            value={form.discount?.toString() || ''}
                            onChange={(e) => setForm({ ...form, discount: e.target.value })}
                            type="number"
                            min="0"
                        />

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
                                rows={3}
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                            />
                        </div>
                    </div>

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

                                    <FormField
                                        label="Publication Date"
                                        name="publicationDate"
                                        placeholder="Publication date"
                                        value={bookFields.publicationDate}
                                        onChange={(e) => setBookFields({ ...bookFields, publicationDate: e.target.value })}
                                        type="date"
                                    />
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
                                            label="Freshness (%)"
                                            name="freshness"
                                            placeholder="Freshness percentage"
                                            value={flowerFields.freshness}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, freshness: e.target.value })}
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            label="Lifespan (days)"
                                            name="lifespan"
                                            placeholder="Lifespan in days"
                                            value={flowerFields.lifespan}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, lifespan: e.target.value })}
                                            type="number"
                                            min="1"
                                            required
                                        />

                                        <FormField
                                            label="Season"
                                            name="season"
                                            placeholder="Growing season"
                                            value={flowerFields.season}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, season: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
                                        <textarea
                                            name="careInstructions"
                                            placeholder="Care instructions for the flower"
                                            value={flowerFields.careInstructions}
                                            onChange={(e) => setFlowerFields({ ...flowerFields, careInstructions: e.target.value })}
                                            rows={3}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#9c6b63]/30 focus:border-[#9c6b63] outline-none"
                                        />
                                    </div>

                                    <FormField
                                        label="Expiry Date"
                                        name="expiryDate"
                                        placeholder="Expiry date"
                                        value={flowerFields.expiryDate}
                                        onChange={(e) => setFlowerFields({ ...flowerFields, expiryDate: e.target.value })}
                                        type="date"
                                    />
                                </div>
                            )}

                            {/* Stationary-specific fields */}
                            {form.type === 'stationary' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            label="Brand"
                                            name="brand"
                                            placeholder="Brand name"
                                            value={stationaryFields.brand}
                                            onChange={(e) => setStationaryFields({ ...stationaryFields, brand: e.target.value })}
                                        />

                                        <FormField
                                            label="Type"
                                            name="stationaryType"
                                            placeholder="Stationary type"
                                            value={stationaryFields.type}
                                            onChange={(e) => setStationaryFields({ ...stationaryFields, type: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            label="Material"
                                            name="material"
                                            placeholder="Material"
                                            value={stationaryFields.material}
                                            onChange={(e) => setStationaryFields({ ...stationaryFields, material: e.target.value })}
                                        />

                                        <FormField
                                            label="Color"
                                            name="stationaryColor"
                                            placeholder="Color (comma separated)"
                                            value={stationaryFields.color}
                                            onChange={(e) => setStationaryFields({ ...stationaryFields, color: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-700">Dimensions</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <FormField
                                                label="Height"
                                                name="height"
                                                placeholder="Height"
                                                value={stationaryFields.dimensions.height}
                                                onChange={(e) => setStationaryFields({
                                                    ...stationaryFields,
                                                    dimensions: { ...stationaryFields.dimensions, height: e.target.value }
                                                })}
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                required
                                            />

                                            <FormField
                                                label="Width"
                                                name="width"
                                                placeholder="Width"
                                                value={stationaryFields.dimensions.width}
                                                onChange={(e) => setStationaryFields({
                                                    ...stationaryFields,
                                                    dimensions: { ...stationaryFields.dimensions, width: e.target.value }
                                                })}
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                required
                                            />

                                            <FormField
                                                label="Depth"
                                                name="depth"
                                                placeholder="Depth"
                                                value={stationaryFields.dimensions.depth}
                                                onChange={(e) => setStationaryFields({
                                                    ...stationaryFields,
                                                    dimensions: { ...stationaryFields.dimensions, depth: e.target.value }
                                                })}
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-[#9c6b63] text-white rounded-lg hover:bg-[#8a5a52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isEdit ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                isEdit ? 'Update Product' : 'Create Product'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
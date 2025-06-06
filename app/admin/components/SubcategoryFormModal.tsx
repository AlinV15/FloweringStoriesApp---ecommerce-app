'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Image as ImageIcon, AlertCircle, Check, AlertTriangle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    onClose: () => void;
    onCategoryAdded: () => void;
    initialData?: {
        _id: string;
        name: string;
        description: string;
        image: string;
        type: string;
    };
}

// Custom toast component
const CustomToast = ({ title, message, type = 'info' }: {
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
}) => {
    return (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full border border-gray-100">
            <div className={`px-4 py-3 flex items-center gap-3 ${type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100' :
                type === 'error' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100' :
                    type === 'warning' ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100' :
                        'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100'
                }`}>
                <div className={`rounded-full p-1.5 ${type === 'success' ? 'bg-green-100 text-green-600' :
                    type === 'error' ? 'bg-red-100 text-red-600' :
                        type === 'warning' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                    }`}>
                    {type === 'success' && <Check size={16} />}
                    {type === 'error' && <X size={16} />}
                    {type === 'warning' && <AlertTriangle size={16} />}
                    {type === 'info' && <AlertCircle size={16} />}
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="px-4 py-3">
                <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
            </div>
        </div>
    );
};

export default function SubcategoryFormModal({ onClose, onCategoryAdded, initialData }: Props) {
    // Form state
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [image, setImage] = useState(initialData?.image || '');
    const [type, setType] = useState(initialData?.type || 'book');

    // New state for local image preview
    const [imagePreview, setImagePreview] = useState(initialData?.image || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const modalRef = useRef<HTMLDivElement>(null);

    // Determine if we're editing or creating
    const isEditMode = Boolean(initialData);

    // Custom toast function
    const showCustomToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full`}>
                <CustomToast title={title} message={message} type={type} />
            </div>
        ), { duration: 4000 });
    };

    // Validation function
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) newErrors.name = "Name is required";
        else if (name.trim().length < 3) newErrors.name = "Name must be at least 3 characters";

        if (!imagePreview && !selectedFile) newErrors.image = "Image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handler for input changes
    const handleInputChange = (field: string, value: string) => {
        // Clear error when field is edited
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }

        // Update the appropriate state
        switch (field) {
            case 'name': setName(value); break;
            case 'description': setDescription(value); break;
            case 'type': setType(value); break;
        }
    };

    // Image selection handler (no upload yet)
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showCustomToast(
                "Invalid File Type",
                "Please select a valid image (JPEG, PNG, WEBP, GIF).",
                "error"
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showCustomToast(
                "File Too Large",
                "Image size must be less than 5MB.",
                "error"
            );
            return;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setSelectedFile(file);

        // Clear image error if it exists
        if (errors.image) {
            setErrors({ ...errors, image: '' });
        }
    };

    // Upload image to Cloudinary
    const uploadImageToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        return data.secure_url;
    };

    // Form submission with validation and image upload
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate before submission
        if (!validateForm()) {
            showCustomToast(
                "Form Validation Error",
                "Please fix the errors in the form before submitting.",
                "error"
            );
            return;
        }

        setLoading(true);

        try {
            let finalImageUrl = image; // Use existing image for edit mode

            // Upload new image if one was selected
            if (selectedFile) {
                finalImageUrl = await uploadImageToCloudinary(selectedFile);
            }

            const method = isEditMode ? 'PATCH' : 'POST';
            const url = isEditMode
                ? `/api/subcategory/${initialData?._id}`
                : `/api/subcategory`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, image: finalImageUrl, type }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to save category');
            }

            showCustomToast(
                "Success",
                `Category ${isEditMode ? 'updated' : 'created'} successfully.`,
                "success"
            );
            onCategoryAdded();
            onClose();
        } catch (error) {
            console.error('Form submission error:', error);
            showCustomToast(
                "Save Error",
                error instanceof Error ? error.message : 'Error saving category',
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    // Simple close handler (no confirmation)
    const handleClose = () => {
        // Clean up preview URL if it exists
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        onClose();
    };

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        // Handle clicks outside the modal
        const handleOutsideClick = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleEscKey);
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            window.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-neutral-900">
            <div
                ref={modalRef}
                className="bg-white rounded-2xl w-full max-w-lg relative shadow-2xl animate-fade-in border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient */}
                <div className="px-6 py-5 bg-gradient-to-r from-[#9c6b63] to-[#b87a6f] text-white rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">
                            {isEditMode ? 'Edit Category' : 'Create New Category'}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-full hover:bg-white/20 transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter category name"
                            value={name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full border-2 ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#9c6b63]'
                                } rounded-xl px-4 py-3 focus:outline-none focus:ring-0 transition-colors font-medium`}
                        />
                        {errors.name && (
                            <p className="mt-2 text-sm text-red-500 flex items-center font-medium">
                                <AlertCircle size={14} className="mr-1" /> {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Description field */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            placeholder="Brief description of the category"
                            value={description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={3}
                            className="w-full border-2 border-gray-200 focus:border-[#9c6b63] rounded-xl px-4 py-3 focus:outline-none focus:ring-0 transition-colors resize-none"
                        />
                    </div>

                    {/* Image upload with enhanced preview */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Category Image <span className="text-red-500">*</span>
                        </label>
                        <div className={`relative border-2 border-dashed rounded-xl ${errors.image
                            ? 'border-red-400 bg-red-50'
                            : 'border-gray-300 hover:border-[#9c6b63] bg-gray-50 hover:bg-[#9c6b63]/5'
                            } transition-all duration-200 group overflow-hidden`}
                        >
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleImageSelect}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                disabled={loading}
                                aria-label="Select image"
                            />

                            {imagePreview ? (
                                <div className="relative">
                                    <div className="w-full h-52 relative overflow-hidden rounded-lg">
                                        <img
                                            src={imagePreview}
                                            alt="Category preview"
                                            className="w-full h-full object-cover object-center transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold shadow-lg transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                <Camera size={16} className="inline mr-2" />
                                                Change Image
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 p-6">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9c6b63] to-[#b87a6f] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <ImageIcon size={28} className="text-white" />
                                    </div>
                                    <p className="text-base font-semibold text-gray-700 mb-1">Upload Category Image</p>
                                    <p className="text-sm text-gray-500 text-center">
                                        Click to select an image<br />
                                        <span className="text-xs">JPEG, PNG, WEBP or GIF (max 5MB)</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {errors.image && (
                            <p className="mt-2 text-sm text-red-500 flex items-center font-medium">
                                <AlertCircle size={14} className="mr-1" /> {errors.image}
                            </p>
                        )}
                    </div>

                    {/* Category type with enhanced styling */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                            Category Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className="w-full border-2 border-gray-200 focus:border-[#9c6b63] rounded-xl px-4 py-3 appearance-none bg-white focus:outline-none focus:ring-0 transition-colors font-medium cursor-pointer"
                        >
                            <option value="book">📚 Book</option>
                            <option value="stationary">✏️ Stationery</option>
                            <option value="flower">🌸 Flower</option>
                        </select>
                    </div>

                    {/* Action buttons with enhanced styling */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all font-semibold"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#9c6b63] to-[#b87a6f] text-white rounded-xl hover:from-[#876058] hover:to-[#9c6b63] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9c6b63] transition-all font-semibold flex items-center justify-center shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={18} className="mr-2" />
                                    {isEditMode ? 'Update Category' : 'Create Category'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
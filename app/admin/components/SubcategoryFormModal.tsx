'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle, Check, AlertTriangle } from 'lucide-react';
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

// Custom toast component to replace default dialogs
const CustomToast = ({ title, message, type = 'info', onConfirm, onCancel }: {
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
}) => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full border border-gray-200">
            <div className={`px-4 py-3 flex items-center gap-3 ${type === 'success' ? 'bg-green-50 border-b border-green-100' :
                type === 'error' ? 'bg-red-50 border-b border-red-100' :
                    type === 'warning' ? 'bg-amber-50 border-b border-amber-100' :
                        type === 'confirm' ? 'bg-blue-50 border-b border-blue-100' :
                            'bg-gray-50 border-b border-gray-100'
                }`}>
                <div className={`rounded-full p-1 ${type === 'success' ? 'bg-green-100 text-green-600' :
                    type === 'error' ? 'bg-red-100 text-red-600' :
                        type === 'warning' ? 'bg-amber-100 text-amber-600' :
                            type === 'confirm' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-600'
                    }`}>
                    {type === 'success' && <Check size={18} />}
                    {type === 'error' && <X size={18} />}
                    {type === 'warning' || type === 'confirm' ? <AlertTriangle size={18} /> : null}
                </div>
                <h3 className="font-medium text-gray-900">{title}</h3>
            </div>
            <div className="px-4 py-3">
                <p className="text-gray-600 text-sm">{message}</p>
            </div>
            {type === 'confirm' && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Confirm
                    </button>
                </div>
            )}
        </div>
    );
};

export default function SubcategoryFormModal({ onClose, onCategoryAdded, initialData }: Props) {
    // Form state
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [image, setImage] = useState(initialData?.image || '');
    const [type, setType] = useState(initialData?.type || 'book');

    // UI state
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isDirty, setIsDirty] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Animation states
    const [isClosing, setIsClosing] = useState(false);

    // Determine if we're editing or creating
    const isEditMode = Boolean(initialData);

    // Custom toast functions that replace default dialogs
    const showCustomToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full`}>
                <CustomToast title={title} message={message} type={type} />
            </div>
        ), { duration: 4000 });
    };

    const showConfirmToast = (title: string, message: string, onConfirm: () => void) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full`}>
                <CustomToast
                    title={title}
                    message={message}
                    type="confirm"
                    onConfirm={() => {
                        onConfirm();
                        toast.dismiss(t.id);
                    }}
                    onCancel={() => toast.dismiss(t.id)}
                />
            </div>
        ), { duration: 10000 });
    };

    // Validation function
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) newErrors.name = "Name is required";
        else if (name.trim().length < 3) newErrors.name = "Name must be at least 3 characters";

        if (!image) newErrors.image = "Image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handler for input changes to track form dirty state
    const handleInputChange = (field: string, value: string) => {
        setIsDirty(true);

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

    // Image upload handler with better error handling
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showCustomToast(
                "Invalid File Type",
                "Please upload a valid image (JPEG, PNG, WEBP, GIF).",
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

        setImageUploading(true);
        setIsDirty(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setImage(data.secure_url);

            // Clear image error if it exists
            if (errors.image) {
                setErrors({ ...errors, image: '' });
            }

            showCustomToast(
                "Upload Successful",
                "Image has been uploaded successfully.",
                "success"
            );
        } catch (err) {
            console.error('Image upload error:', err);
            showCustomToast(
                "Upload Failed",
                "There was an error uploading your image. Please try again.",
                "error"
            );
        } finally {
            setImageUploading(false);
        }
    };

    // Form submission with validation
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
            const method = isEditMode ? 'PATCH' : 'POST';
            const url = isEditMode
                ? `/api/subcategory/${initialData?._id}`
                : `/api/subcategory`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, image, type }),
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
            handleCloseWithAnimation();
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

    // Close with animation
    const handleCloseWithAnimation = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

    // Confirmation before closing with unsaved changes
    const handleClose = () => {
        if (isDirty) {
            showConfirmToast(
                "Unsaved Changes",
                "You have unsaved changes that will be lost. Are you sure you want to close?",
                () => handleCloseWithAnimation()
            );
        } else {
            handleCloseWithAnimation();
        }
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
    }, [isDirty]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-xl w-full max-w-md relative shadow-xl animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {isEditMode ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Category name"
                            value={name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'
                                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9c6b63] transition`}

                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                <AlertCircle size={14} className="mr-1" /> {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Description field */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            placeholder="Brief category description"
                            value={description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9c6b63] transition"
                        />
                    </div>

                    {/* Image upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category Image <span className="text-red-500">*</span>
                        </label>
                        <div className={`relative border-2 border-dashed rounded-lg ${errors.image
                            ? 'border-red-400 bg-red-50'
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                            } transition group`}
                        >
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                disabled={imageUploading}
                                aria-label="Upload image"
                            />

                            {image ? (
                                <div className="w-full h-48 relative overflow-hidden rounded-md">
                                    <img
                                        src={image}
                                        alt="Category preview"
                                        className="w-full h-full object-cover object-center transition group-hover:opacity-75"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition">
                                        <div className="bg-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                                            Change image
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 p-4">
                                    {imageUploading ? (
                                        <div className="text-center">
                                            <Loader2 size={30} className="animate-spin text-[#9c6b63] mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Uploading...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                                                <ImageIcon size={24} className="text-gray-500" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                                            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WEBP or GIF (max 5MB)</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {errors.image && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                <AlertCircle size={14} className="mr-1" /> {errors.image}
                            </p>
                        )}
                    </div>

                    {/* Category type */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            Category Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#9c6b63] transition"
                        >
                            <option value="book">Book</option>
                            <option value="stationary">Stationery</option>
                            <option value="flower">Flower</option>
                        </select>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || imageUploading}
                            className="flex-1 px-4 py-2 bg-[#9c6b63] text-white rounded-md hover:bg-[#876058] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9c6b63] transition-colors flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                `Save ${isEditMode ? 'Changes' : 'Category'}`
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
'use client';
import { useState } from 'react';

const SettingsPage = () => {
    const [shopName, setShopName] = useState('');
    const [description, setDescription] = useState('');
    const [favicon, setFavicon] = useState<File | null>(null);
    const [faviconUrl, setFaviconUrl] = useState<string>('');
    const [logo, setLogo] = useState<File | null>(null);
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [currency, setCurrency] = useState('EUR');
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [freeShipping, setFreeShipping] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // Reset the form fields
    const resetForm = () => {
        setShopName('');
        setDescription('');
        setFavicon(null);
        setFaviconUrl('');
        setLogo(null);
        setLogoUrl('');
        setCurrency('EUR');
        setPaymentMethod('stripe');
        setFreeShipping(false);
    };

    // Handle favicon upload
    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file && file.type === 'image/x-icon') {
            setFavicon(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFaviconUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setError('Please upload a valid icon file (.ico)');
        }
    };

    // Handle logo upload to Cloudinary
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Function to upload favicon and logo to Cloudinary
    const uploadToCloudinary = async (file: File, folder: string) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'your_cloudinary_upload_preset');
        formData.append('folder', folder);

        try {
            const res = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            return data.secure_url;
        } catch (err) {
            setError('Error uploading image to Cloudinary');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Save the form data
    const handleSave = async () => {
        if (loading) return;
        setLoading(true);
        setError('');

        try {
            // Upload favicon and logo
            const uploadedLogoUrl = logo ? await uploadToCloudinary(logo, 'logos') : '';
            const uploadedFaviconUrl = favicon
                ? await uploadToCloudinary(favicon, 'favicons')
                : '';

            // Prepare the data to be saved
            const formData = {
                shopName,
                description,
                faviconUrl: uploadedFaviconUrl || faviconUrl, // fallback to local URL if not uploaded
                headerLogoUrl: uploadedLogoUrl,
                currency,
                paymentMethod,
                freeShipping,
            };

            // Simulate sending data to the server (use your API here)
            console.log('Saving settings:', formData);

            alert('Settings saved successfully!');
            resetForm();
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold text-[#9c6b63] mb-6 text-center">Store Settings</h1>

            <div className="space-y-6">
                {/* General Settings */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[#9c6b63]">General Settings</h2>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="shopName" className="text-sm font-medium text-[#9c6b63]">
                            Shop Name
                        </label>
                        <input
                            id="shopName"
                            type="text"
                            className="px-4 py-3 border rounded-md shadow-sm focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            placeholder="Enter shop name"
                        />
                        <label htmlFor="description" className="text-sm font-medium text-[#9c6b63]">
                            Shop Description
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            className="px-4 py-3 border rounded-md shadow-sm focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter shop description"
                        />
                    </div>
                </div>

                {/* Favicon upload */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[#9c6b63]">Favicon Settings</h2>
                    <input
                        id="favicon"
                        type="file"
                        accept="image/x-icon"
                        className="px-4 py-3 border rounded-md shadow-sm focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                        onChange={handleFaviconChange}
                    />
                    {faviconUrl && (
                        <div className="my-4 flex flex-col items-center">
                            <img
                                src={faviconUrl}
                                alt="Favicon Preview"
                                className="w-16 h-16 object-cover mb-2"
                            />
                        </div>
                    )}
                    {error && <p className="text-red-600 mt-2">{error}</p>}
                </div>

                {/* Header Logo Upload */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[#9c6b63]">Header Logo Settings</h2>
                    <input
                        id="logo"
                        type="file"
                        accept="image/*"
                        className="px-4 py-3 border rounded-md shadow-sm focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                        onChange={handleLogoChange}
                    />
                    {logoUrl && (
                        <div className="my-4 flex flex-col items-center">
                            <img
                                src={logoUrl}
                                alt="Logo Preview"
                                className="w-24 h-24 object-cover rounded-full mb-2"
                            />
                        </div>
                    )}
                    {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c6b63]" />}
                </div>

                {/* Payment and Shipping Settings */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[#9c6b63]">Payment Settings</h2>
                    <select
                        id="paymentMethod"
                        className="px-4 py-3 border rounded-md shadow-sm focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                        <option value="bank">Bank Transfer</option>
                    </select>
                </div>

                {/* Shipping Settings */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[#9c6b63]">Shipping Settings</h2>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="freeShipping" className="text-sm font-medium text-[#9c6b63]">
                            Enable Free Shipping
                        </label>
                        <input
                            id="freeShipping"
                            type="checkbox"
                            checked={freeShipping}
                            onChange={(e) => setFreeShipping(e.target.checked)}
                            className="h-4 w-4 text-[#9c6b63]"
                        />
                    </div>
                </div>

                {/* Save and Cancel Buttons */}
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={resetForm}
                        className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-[#9c6b63] text-white rounded-lg hover:bg-[#7a4f43] transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

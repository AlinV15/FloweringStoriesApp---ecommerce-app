import mongoose from 'mongoose';

const shopSettingsSchema = new mongoose.Schema(
    {
        shopName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        logo: {
            type: {
                favicon: String, // URL al favicon-ului stocat
                headerLogo: String, // URL al logo-ului stocat
            }, // URL al logo-ului stocat
            required: false,
        },
        currency: {
            type: String,
            enum: ['RON', 'USD', 'EUR'], // Exemple de monede acceptate
            default: 'RON',
        },
        paymentMethod: {
            type: String,
            enum: ['stripe', 'paypal', 'bank'],
            default: 'stripe',
        },
        freeShipping: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.models.ShopSettings ||
    mongoose.model('ShopSettings', shopSettingsSchema);

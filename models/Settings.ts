import mongoose, { Schema, Model } from 'mongoose';

export interface ISettings {
    siteName: string;
    adminEmail: string;
    enableNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    unionNameEn: string;
    unionNameBn: string;
    unionAddressEn: string;
    unionAddressBn: string;
    chairmanNameEn: string;
    chairmanNameBn: string;
    unionEmail?: string;
    unionWebsite?: string;
    unionLogo?: string;
    holdingTaxAmount: number;
    isHoldingTaxMandatory: boolean;
    holdingTaxYearStartMonth: number;
    updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
    siteName: {
        type: String,
        required: true,
        default: 'Admin Dashboard',
    },
    adminEmail: {
        type: String,
        required: true,
        default: 'admin@example.com',
    },
    enableNotifications: {
        type: Boolean,
        default: true,
    },
    theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'dark',
    },
    language: {
        type: String,
        default: 'en',
    },
    timezone: {
        type: String,
        default: 'UTC',
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    unionNameEn: { type: String, default: 'Union Parishad' },
    unionNameBn: { type: String, default: 'ইউনিয়ন পরিষদ' },
    unionAddressEn: { type: String, default: '' },
    unionAddressBn: { type: String, default: '' },
    chairmanNameEn: { type: String, default: '' },
    chairmanNameBn: { type: String, default: '' },
    unionEmail: { type: String, default: '' },
    unionWebsite: { type: String, default: '' },
    unionLogo: { type: String, default: '' },
    holdingTaxAmount: { type: Number, default: 0 },
    isHoldingTaxMandatory: { type: Boolean, default: false },
    holdingTaxYearStartMonth: { type: Number, default: 7 }, // July
});

if (mongoose.models && mongoose.models.Settings) {
    delete mongoose.models.Settings;
}

const Settings: Model<ISettings> = mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;

import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { defaultSettings, isDbConnectionError } from '@/lib/mockData';

export async function getSettings() {
    try {
        await dbConnect();

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create(defaultSettings);
        }

        // Convert Mongoose document to plain object if needed, or return as is
        // Returning JSON friendly object primarily
        return JSON.parse(JSON.stringify(settings));
    } catch (error) {
        if (!isDbConnectionError(error)) {
            console.error('Settings fetch error:', error);
        }
        return defaultSettings;
    }
}

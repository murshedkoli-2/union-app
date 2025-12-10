import mongoose, { Schema, Model } from 'mongoose';

export interface IAnalytics {
    date: Date;
    totalUsers: number;
    activeUsers: number;
    revenue: number;
    conversions: number;
    sessions: number;
    bounceRate: number;
}

const AnalyticsSchema = new Schema<IAnalytics>({
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    totalUsers: {
        type: Number,
        default: 0,
    },
    activeUsers: {
        type: Number,
        default: 0,
    },
    revenue: {
        type: Number,
        default: 0,
    },
    conversions: {
        type: Number,
        default: 0,
    },
    sessions: {
        type: Number,
        default: 0,
    },
    bounceRate: {
        type: Number,
        default: 0,
    },
});

const Analytics: Model<IAnalytics> =
    mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;

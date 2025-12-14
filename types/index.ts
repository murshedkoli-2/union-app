export interface SettingsData {
    siteName: string;
    adminEmail: string;
    otpEnabled?: boolean;
    enableNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    unionNameEn?: string;
    unionNameBn?: string;
    unionAddressEn?: string;
    unionAddressBn?: string;
    chairmanNameEn?: string;
    chairmanNameBn?: string;
    unionEmail?: string;
    unionWebsite?: string;
    unionLogo?: string;
    holdingTaxAmount?: number;
    isHoldingTaxMandatory?: boolean;
}

export interface AnalyticsData {
    date: string;
    totalUsers: number;
    activeUsers: number;
    revenue: number;
    conversions: number;
    sessions: number;
    bounceRate: number;
}

export interface StatCardData {
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down';
    icon: string;
}

export interface ChartData {
    name: string;
    value: number;
    [key: string]: string | number;
}

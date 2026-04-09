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

export interface AuthSession {
    id: string;
    role: string;
}

export interface AuthUser {
    _id?: string;
    id?: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
}

export interface AuthContextValue {
    user: AuthUser | null;
    session: AuthSession | null;
    status: 'authenticated' | 'loading' | 'unauthenticated';
    refreshProfile: () => Promise<AuthUser | null>;
    logout: () => Promise<void>;
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface RouteAccessRule {
    access: 'public' | 'protected';
    methods?: string[];
    pattern: string;
}

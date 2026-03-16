import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(d);
}

export function formatPercentage(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
}

/**
 * Removes any Bangla characters from the text.
 * Allows English letters, numbers, and symbols.
 */
export function formatEnglishInput(text: string): string {
    // Remove Bangla Unicode characters (\u0980-\u09FF)
    return text.replace(/[\u0980-\u09FF]/g, '');
}

/**
 * Removes any English letters from the text.
 * Allows Bangla characters, numbers, and symbols.
 */
export function formatBanglaInput(text: string): string {
    // Remove English letters (a-z, A-Z)
    return text.replace(/[a-zA-Z]/g, '');
}

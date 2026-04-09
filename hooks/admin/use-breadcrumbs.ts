'use client';

import { useMemo } from 'react';

import { usePathname } from 'next/navigation';

import { useLanguage } from '@/components/providers/LanguageContext';
import type { BreadcrumbItem } from '@/types';

function humanizeSegment(segment: string) {
    return segment
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function useBreadcrumbs() {
    const pathname = usePathname();
    const { language } = useLanguage();

    return useMemo<BreadcrumbItem[]>(() => {
        const labels: Record<string, { bn: string; en: string }> = {
            add: { bn: 'নতুন', en: 'Add' },
            admin: { bn: 'অ্যাডমিন', en: 'Admin' },
            certificates: { bn: 'সনদসমূহ', en: 'Certificates' },
            citizens: { bn: 'নাগরিক', en: 'Citizens' },
            dashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
            edit: { bn: 'সম্পাদনা', en: 'Edit' },
            'holding-tax': { bn: 'হোল্ডিং ট্যাক্স', en: 'Holding Tax' },
            issue: { bn: 'ইস্যু', en: 'Issue' },
            reports: { bn: 'রিপোর্ট', en: 'Reports' },
            settings: { bn: 'সেটিংস', en: 'Settings' },
            team: { bn: 'টিম', en: 'Team' },
            types: { bn: 'ধরন', en: 'Types' },
        };

        const segments = pathname.split('/').filter(Boolean);
        const trail: BreadcrumbItem[] = [];
        let href = '';

        for (const segment of segments) {
            href += `/${segment}`;

            if (segment === 'admin') {
                trail.push({
                    href: '/admin/dashboard',
                    label: language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড',
                });
                continue;
            }

            const isDynamic = /^[a-f0-9]{24}$/i.test(segment) || /^\d+$/.test(segment);
            const translated = labels[segment];
            const label = isDynamic
                ? language === 'en'
                    ? 'Details'
                    : 'বিস্তারিত'
                : translated
                    ? translated[language]
                    : humanizeSegment(segment);

            trail.push({
                href,
                label,
            });
        }

        if (trail.length === 0) {
            return [
                {
                    href: '/admin/dashboard',
                    label: language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড',
                },
            ];
        }

        trail[trail.length - 1] = {
            ...trail[trail.length - 1],
            href: undefined,
        };

        return trail;
    }, [language, pathname]);
}

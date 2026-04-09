import { revalidateTag, unstable_cache } from 'next/cache';

import { getSettings } from '@/lib/settings';

export const SETTINGS_CACHE_TAG = 'settings';

const loadCachedSettings = unstable_cache(async () => getSettings(), ['settings'], {
    tags: [SETTINGS_CACHE_TAG],
});

export async function getCachedSettings() {
    return loadCachedSettings();
}

export function revalidateCachedSettings() {
    revalidateTag(SETTINGS_CACHE_TAG, 'max');
}

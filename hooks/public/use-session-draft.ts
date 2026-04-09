'use client';

import { useEffect, useState } from 'react';

export function useSessionDraft<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(initialValue);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const rawValue = sessionStorage.getItem(key);

            if (rawValue) {
                setValue(JSON.parse(rawValue) as T);
            }
        } catch {
            setValue(initialValue);
        } finally {
            setHydrated(true);
        }
    }, [initialValue, key]);

    useEffect(() => {
        if (!hydrated) {
            return;
        }

        sessionStorage.setItem(key, JSON.stringify(value));
    }, [hydrated, key, value]);

    const clear = () => {
        sessionStorage.removeItem(key);
        setValue(initialValue);
    };

    return {
        clear,
        hydrated,
        setValue,
        value,
    };
}

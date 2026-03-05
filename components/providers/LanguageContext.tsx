'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, Translation } from '@/lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translation;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        if (typeof window === 'undefined') return 'en';
        const savedLang = localStorage.getItem('language');
        return savedLang === 'bn' || savedLang === 'en' ? savedLang : 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
        const root = window.document.documentElement;
        root.lang = language;
        root.setAttribute('data-lang', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'en' ? 'bn' : 'en'));
    };

    const value = {
        language,
        setLanguage,
        t: translations[language],
        toggleLanguage,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

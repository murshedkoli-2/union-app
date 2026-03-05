'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageContext';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
    const { theme, toggleTheme } = useTheme();
    const { language } = useLanguage();
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const switchLabel = language === 'en'
        ? `Switch to ${nextTheme} mode`
        : `${nextTheme === 'dark' ? 'ডার্ক' : 'লাইট'} মোডে পরিবর্তন করুন`;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={switchLabel}
            title={switchLabel}
            className="text-muted-foreground hover:text-foreground transition-colors"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{language === 'en' ? 'Toggle theme' : 'থিম পরিবর্তন'}</span>
        </Button>
    );
}

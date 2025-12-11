'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X, Languages } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageContext';
import { useSettings } from '@/components/providers/SettingsContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { ModeToggle } from '@/components/ui/mode-toggle';

export default function PublicHeader() {
    const { t, language, toggleLanguage } = useLanguage();
    const { settings } = useSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { label: t.nav.home, href: '/' },
        { label: t.nav.citizenRegistration, href: '/apply/citizen' },
        { label: t.nav.certificates, href: '/apply/certificate' },
        { label: t.nav.verify, href: '/verify' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl z-50 relative">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="font-display hidden sm:inline-block">{settings.siteName || 'UnionPortal'}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted",
                                    isActive(item.href) ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Language Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <Languages size={18} />
                            <span className="text-sm font-medium uppercase">{language}</span>
                        </Button>

                        <ModeToggle />

                        <Link href="/login">
                            <Button variant="default" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none">
                                {t.nav.adminLogin}
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleLanguage}
                            className="p-2 h-auto"
                        >
                            <span className="text-sm font-bold uppercase">{language}</span>
                        </Button>
                        <ModeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="relative z-50"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-background border-t border-border mt-16 md:hidden px-4 py-6 flex flex-col gap-4 overflow-y-auto h-[calc(100vh-4rem)]"
                    >
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "flex items-center p-4 rounded-xl text-lg font-medium transition-colors",
                                        isActive(item.href)
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted/30 text-foreground hover:bg-muted"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto flex flex-col gap-4">
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full" size="lg">
                                    {t.nav.adminLogin}
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

'use client';

import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
    ArrowRight,
    FileText,
    Home,
    Languages,
    Menu,
    SearchCheck,
    ShieldCheck,
    UserPlus,
    X,
} from 'lucide-react';

import { useLanguage } from '@/components/providers/LanguageContext';
import { useSettings } from '@/components/providers/SettingsContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavItem = {
    description: string;
    href: string;
    icon: typeof Home;
    label: string;
};

export default function PublicHeader() {
    const { t, language, toggleLanguage } = useLanguage();
    const { settings } = useSettings();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const portalReady = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false
    );

    const siteTitle = settings.siteName || 'UnionPortal';
    const homeLabel = language === 'en' ? 'Go to home page' : 'হোম পেইজে যান';
    const openMenuLabel = language === 'en' ? 'Open menu' : 'মেনু খুলুন';
    const closeMenuLabel = language === 'en' ? 'Close menu' : 'মেনু বন্ধ করুন';
    const languageToggleLabel = language === 'en' ? 'Switch language to Bangla' : 'ভাষা ইংরেজিতে পরিবর্তন করুন';
    const menuTitle = language === 'en' ? 'Portal navigation' : 'পোর্টাল নেভিগেশন';
    const menuDescription =
        language === 'en'
            ? 'Choose the service you need and move through the portal with confidence.'
            : 'আপনার প্রয়োজনীয় সেবাটি বেছে নিয়ে আত্মবিশ্বাসের সাথে পোর্টাল ব্যবহার করুন।';

    const navItems: NavItem[] = [
        {
            label: t.nav.home,
            href: '/',
            icon: Home,
            description: language === 'en' ? 'Back to the public homepage.' : 'পাবলিক হোমপেইজে ফিরে যান।',
        },
        {
            label: t.nav.citizenRegistration,
            href: '/apply/citizen',
            icon: UserPlus,
            description: language === 'en' ? 'Register as a citizen online.' : 'অনলাইনে নাগরিক হিসেবে নিবন্ধন করুন।',
        },
        {
            label: t.nav.certificates,
            href: '/apply/certificate',
            icon: FileText,
            description: language === 'en' ? 'Apply for official certificates.' : 'অফিসিয়াল সনদের জন্য আবেদন করুন।',
        },
        {
            label: t.nav.verify,
            href: '/verify',
            icon: SearchCheck,
            description: language === 'en' ? 'Verify documents and track status.' : 'সনদ যাচাই ও স্ট্যাটাস দেখুন।',
        },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const closeMenu = () => setIsMenuOpen(false);

    const renderInlineNavItem = (item: NavItem, compact = false) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
            <Link
                key={`${compact ? 'compact' : 'inline'}-${item.href}`}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                    'group inline-flex items-center gap-2 rounded-xl text-sm font-medium transition-all',
                    compact ? 'min-w-[140px] flex-1 justify-center px-3 py-3' : 'shrink-0 px-3 py-2.5 xl:px-3.5',
                    active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-card hover:text-foreground'
                )}
            >
                <span
                    className={cn(
                        'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                        active
                            ? 'bg-white/14 text-white'
                            : 'bg-muted/70 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    )}
                >
                    <Icon size={16} />
                </span>
                <span className={cn(compact && 'truncate')}>{item.label}</span>
            </Link>
        );
    };

    return (
        <header
            className={cn(
                'sticky top-0 isolate w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55',
                isMenuOpen ? 'z-[4000]' : 'z-[70]'
            )}
        >
            <div className="container mx-auto px-4 py-3">
                <div className="rounded-[26px] border border-border/70 bg-card/88 px-3 py-3 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:px-4">
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <Link href="/" aria-label={homeLabel} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-1.5 xl:flex-none">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_14%,var(--card)),var(--card))] shadow-sm sm:h-11 sm:w-11">
                                {settings.unionLogo ? (
                                    <Image
                                        src={settings.unionLogo}
                                        alt="Logo"
                                        width={40}
                                        height={40}
                                        className="h-full w-full object-contain p-1"
                                        unoptimized
                                    />
                                ) : (
                                    <ShieldCheck size={22} className="text-primary" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80 sm:text-sm">
                                    {language === 'en' ? 'Official portal' : 'অফিসিয়াল পোর্টাল'}
                                </p>
                                <p className="truncate font-display text-sm font-bold text-foreground sm:text-lg">{siteTitle}</p>
                            </div>
                        </Link>

                        <nav aria-label="Primary" className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
                            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-border/70 bg-background/70 p-1.5">
                                {navItems.map((item) => renderInlineNavItem(item))}
                            </div>
                        </nav>

                        <div className="ml-auto hidden items-center gap-2 md:flex">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleLanguage}
                                aria-label={languageToggleLabel}
                                className="h-10 rounded-xl border border-border/70 px-3 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                            >
                                <Languages size={17} />
                                <span className="ml-2 text-xs font-semibold uppercase">{language}</span>
                            </Button>

                            <Link href="/login" className="hidden lg:block">
                                <Button className="h-10 rounded-xl bg-foreground px-4 text-background hover:bg-foreground/90">
                                    {t.nav.adminLogin}
                                    <ArrowRight size={16} />
                                </Button>
                            </Link>
                        </div>

                        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleLanguage}
                                aria-label={languageToggleLabel}
                                className="h-10 rounded-xl border border-border/70 px-2.5 text-muted-foreground hover:bg-muted/70"
                            >
                                <Languages size={16} />
                                <span className="ml-1.5 text-[11px] font-semibold uppercase">{language}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMenuOpen((prev) => !prev)}
                                aria-label={isMenuOpen ? closeMenuLabel : openMenuLabel}
                                aria-expanded={isMenuOpen}
                                aria-controls="mobile-public-nav"
                                className="h-10 w-10 rounded-xl border border-border/70 bg-background/70 text-foreground hover:bg-muted/70"
                            >
                                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                            </Button>
                        </div>
                    </div>

                    <div className="mt-3 hidden md:block xl:hidden">
                        <div className="rounded-[22px] border border-border/70 bg-background/70 p-1.5">
                            <nav aria-label="Tablet primary" className="flex flex-wrap gap-1.5">
                                {navItems.map((item) => renderInlineNavItem(item, true))}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {portalReady
                ? createPortal(
                      <AnimatePresence>
                          {isMenuOpen && (
                              <>
                                  <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="fixed inset-0 z-[4100] bg-black/40 backdrop-blur-sm md:hidden"
                                      onClick={closeMenu}
                                  />

                                  <motion.div
                                      id="mobile-public-nav"
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 20 }}
                                      transition={{ duration: 0.22, ease: 'easeOut' }}
                                      className="fixed inset-0 z-[4200] flex flex-col bg-background/96 px-4 pb-6 pt-4 backdrop-blur-xl md:hidden"
                                  >
                                      <div className="flex items-center justify-between gap-3 pb-4">
                                          <div className="min-w-0">
                                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">{menuTitle}</p>
                                              <p className="mt-1 truncate text-base font-bold text-foreground">{siteTitle}</p>
                                          </div>

                                          <button
                                              onClick={closeMenu}
                                              aria-label={closeMenuLabel}
                                              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground transition-colors hover:bg-muted/70"
                                          >
                                              <X size={20} />
                                          </button>
                                      </div>

                                      <div className="flex-1 overflow-y-auto">
                                          <div className="rounded-[26px] border border-border/70 bg-card/92 p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
                                              <div className="rounded-[22px] border border-primary/15 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_10%,var(--card)),color-mix(in_oklab,var(--accent)_8%,var(--card)))] p-4">
                                                  <p className="text-sm leading-6 text-muted-foreground">{menuDescription}</p>
                                              </div>

                                              <nav aria-label="Mobile primary" className="mt-4 grid gap-3">
                                                  {navItems.map((item) => {
                                                      const Icon = item.icon;
                                                      const active = isActive(item.href);

                                                      return (
                                                          <Link
                                                              key={`mobile-${item.href}`}
                                                              href={item.href}
                                                              onClick={closeMenu}
                                                              aria-current={active ? 'page' : undefined}
                                                              className={cn(
                                                                  'group flex items-center gap-3 rounded-[20px] border px-4 py-3.5 transition-all',
                                                                  active
                                                                      ? 'border-primary/30 bg-primary text-primary-foreground shadow-sm'
                                                                      : 'border-border/70 bg-background/85 text-foreground hover:bg-muted/70'
                                                              )}
                                                          >
                                                              <span
                                                                  className={cn(
                                                                      'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                                                                      active ? 'bg-white/14 text-white' : 'bg-primary/10 text-primary'
                                                                  )}
                                                              >
                                                                  <Icon size={20} />
                                                              </span>

                                                              <span className="min-w-0 flex-1">
                                                                  <span className="block text-[15px] font-semibold">{item.label}</span>
                                                                  <span className={cn('mt-1 block text-xs', active ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                                                                      {item.description}
                                                                  </span>
                                                              </span>

                                                              <ArrowRight
                                                                  size={18}
                                                                  className={cn(
                                                                      'shrink-0 transition-transform group-hover:translate-x-1',
                                                                      active ? 'text-white' : 'text-muted-foreground'
                                                                  )}
                                                              />
                                                          </Link>
                                                      );
                                                  })}
                                              </nav>

                                              <div className="mt-4 grid gap-3">
                                                  <Link href="/login" onClick={closeMenu}>
                                                      <Button className="h-11 w-full rounded-xl bg-foreground text-background hover:bg-foreground/90">
                                                          {t.nav.adminLogin}
                                                      </Button>
                                                  </Link>

                                                  <button
                                                      onClick={() => {
                                                          toggleLanguage();
                                                          closeMenu();
                                                      }}
                                                      className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                                                  >
                                                      <Languages size={16} className="mr-2 shrink-0" />
                                                      <span className="truncate">{language === 'en' ? 'বাংলা দেখুন' : 'View English'}</span>
                                                  </button>
                                              </div>
                                          </div>
                                      </div>
                                  </motion.div>
                              </>
                          )}
                      </AnimatePresence>,
                      document.body
                  )
                : null}
        </header>
    );
}

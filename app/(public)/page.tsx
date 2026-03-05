'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRight,
    BadgeCheck,
    CheckCircle2,
    Clock3,
    FileText,
    Mail,
    Phone,
    SearchCheck,
    ShieldCheck,
    UserPlus,
    Users,
} from 'lucide-react';

import { useLanguage } from '@/components/providers/LanguageContext';

interface TeamMember {
    _id: string;
    nameEn: string;
    nameBn: string;
    designation: string;
    phone: string;
    email?: string;
    image?: string;
}

export default function PublicHome() {
    const { t, language } = useLanguage();
    const [team, setTeam] = useState<TeamMember[]>([]);

    const highlights = [
        {
            icon: Clock3,
            title: language === 'en' ? 'Fast Service Delivery' : 'দ্রুত সেবা প্রদান',
            description:
                language === 'en'
                    ? 'Most services are processed digitally with clear status tracking.'
                    : 'বেশিরভাগ সেবা ডিজিটালভাবে প্রক্রিয়াকরণ হয় এবং স্ট্যাটাস সহজে ট্র্যাক করা যায়।',
        },
        {
            icon: BadgeCheck,
            title: language === 'en' ? 'Verified Official Records' : 'যাচাইকৃত অফিসিয়াল রেকর্ড',
            description:
                language === 'en'
                    ? 'Every issued certificate can be verified instantly from official data.'
                    : 'প্রদানকৃত প্রতিটি সনদ অফিসিয়াল ডেটা থেকে তাৎক্ষণিক যাচাই করা যায়।',
        },
        {
            icon: Users,
            title: language === 'en' ? 'Citizen-Centric Portal' : 'নাগরিক-কেন্দ্রিক পোর্টাল',
            description:
                language === 'en'
                    ? 'A modern portal built to reduce office visits and save time.'
                    : 'অফিসে যাতায়াত কমিয়ে সময় বাঁচাতে তৈরি আধুনিক পোর্টাল।',
        },
    ];

    const steps = [
        {
            icon: UserPlus,
            title: language === 'en' ? 'Register or Identify' : 'নিবন্ধন বা পরিচয় নিশ্চিত',
            description:
                language === 'en'
                    ? 'Create your citizen profile or verify your NID before applying.'
                    : 'আবেদনের আগে নাগরিক প্রোফাইল তৈরি করুন বা NID দিয়ে পরিচয় নিশ্চিত করুন।',
        },
        {
            icon: FileText,
            title: language === 'en' ? 'Submit Application' : 'আবেদন জমা দিন',
            description:
                language === 'en'
                    ? 'Choose a service, provide details, and submit your request online.'
                    : 'সেবা নির্বাচন করে প্রয়োজনীয় তথ্য দিয়ে অনলাইনে আবেদন জমা দিন।',
        },
        {
            icon: SearchCheck,
            title: language === 'en' ? 'Track and Verify' : 'ট্র্যাক ও যাচাই করুন',
            description:
                language === 'en'
                    ? 'Check progress and verify final certificates from this portal.'
                    : 'এই পোর্টাল থেকেই অগ্রগতি দেখুন এবং চূড়ান্ত সনদ যাচাই করুন।',
        },
    ];

    useEffect(() => {
        fetch('/api/team')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setTeam(data);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="flex flex-col">
            <section className="reveal-up relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-secondary/65 via-background to-background pt-12 pb-16 md:pt-[4.5rem] md:pb-[5.5rem]">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-28 -left-20 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
                    <div className="absolute top-16 -right-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
                </div>

                <div className="container relative z-10 mx-auto px-4">
                    <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                                <ShieldCheck size={16} />
                                {t.common.officialPortal}
                            </div>

                            <h1 className="mb-5 text-3xl font-bold leading-[1.12] text-foreground sm:text-5xl lg:text-6xl">
                                {t.home.welcomeTitle}{' '}
                                <span className="text-primary">{t.home.unionName}</span>{' '}
                                {t.home.unionSuffix}
                            </h1>

                            <p className="mb-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                {t.home.subtitle}
                            </p>

                            <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                                <Link
                                    href="/apply/citizen"
                                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    <UserPlus size={18} />
                                    {t.home.registerCitizen}
                                </Link>
                                <Link
                                    href="/apply/certificate"
                                    className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-6 font-semibold text-card-foreground transition-colors hover:bg-muted/70"
                                >
                                    <FileText size={18} />
                                    {t.home.applyCertificate}
                                </Link>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
                                    <span className="mb-1 block font-semibold text-foreground">
                                        {language === 'en' ? 'Reliable' : 'বিশ্বস্ত'}
                                    </span>
                                    {language === 'en' ? 'Official union platform' : 'অফিসিয়াল ইউনিয়ন প্ল্যাটফর্ম'}
                                </div>
                                <div className="rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
                                    <span className="mb-1 block font-semibold text-foreground">
                                        {language === 'en' ? 'Transparent' : 'স্বচ্ছ'}
                                    </span>
                                    {language === 'en' ? 'Trackable application flow' : 'ট্র্যাকযোগ্য আবেদন প্রক্রিয়া'}
                                </div>
                                <div className="rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
                                    <span className="mb-1 block font-semibold text-foreground">
                                        {language === 'en' ? 'Accessible' : 'সহজলভ্য'}
                                    </span>
                                    {language === 'en' ? 'Services from anywhere' : 'যেকোনো স্থান থেকে সেবা'}
                                </div>
                            </div>
                        </div>

                        <div className="reveal-up reveal-delay-1 rounded-2xl border border-border/70 bg-card/85 p-7 shadow-[0_20px_70px_-35px_rgba(26,55,68,0.45)] backdrop-blur">
                            <h2 className="mb-4 text-xl font-semibold text-foreground sm:text-2xl">
                                {language === 'en' ? 'Why Citizens Use This Portal' : 'নাগরিকরা কেন এই পোর্টাল ব্যবহার করেন'}
                            </h2>
                            <div className="space-y-4">
                                {highlights.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.title} className="rounded-xl border border-border/60 bg-background/90 p-4">
                                            <div className="mb-2 flex items-center gap-3">
                                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                                                    <Icon size={18} />
                                                </span>
                                                <h3 className="font-semibold text-foreground">{item.title}</h3>
                                            </div>
                                            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <Link
                                href="/verify"
                                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                            >
                                {t.home.checkStatus}
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="reveal-up reveal-delay-1 border-b border-border/60 bg-background py-8">
                <div className="container mx-auto grid gap-4 px-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/70 bg-card p-4">
                        <p className="text-sm text-muted-foreground">{language === 'en' ? 'Core Service' : 'মূল সেবা'}</p>
                        <p className="mt-1 text-base font-semibold text-foreground">{t.home.features.citizenReg.title}</p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-card p-4">
                        <p className="text-sm text-muted-foreground">{language === 'en' ? 'Digital Facility' : 'ডিজিটাল সুবিধা'}</p>
                        <p className="mt-1 text-base font-semibold text-foreground">{t.home.features.onlineCert.title}</p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-card p-4">
                        <p className="text-sm text-muted-foreground">{language === 'en' ? 'Trust Layer' : 'বিশ্বাসযোগ্যতা'}</p>
                        <p className="mt-1 text-base font-semibold text-foreground">{t.home.features.verifyDocs.title}</p>
                    </div>
                </div>
            </section>

            <section className="reveal-up reveal-delay-2 bg-secondary/35 py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                            {language === 'en' ? 'Everything You Need in One Place' : 'সব সেবা এক প্ল্যাটফর্মে'}
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                            {language === 'en'
                                ? 'Designed for citizens and local administration with a clear, dependable, and modern experience.'
                                : 'নাগরিক এবং স্থানীয় প্রশাসনের জন্য পরিষ্কার, নির্ভরযোগ্য ও আধুনিক অভিজ্ঞতা নিয়ে ডিজাইন করা।'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-2xl border border-border/60 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                                <UserPlus size={24} />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-foreground">{t.home.features.citizenReg.title}</h3>
                            <p className="leading-relaxed text-muted-foreground">{t.home.features.citizenReg.desc}</p>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20 text-accent">
                                <FileText size={24} />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-foreground">{t.home.features.onlineCert.title}</h3>
                            <p className="leading-relaxed text-muted-foreground">{t.home.features.onlineCert.desc}</p>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-foreground">{t.home.features.verifyDocs.title}</h3>
                            <p className="leading-relaxed text-muted-foreground">{t.home.features.verifyDocs.desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="reveal-up reveal-delay-2 bg-background py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                            {language === 'en' ? 'How It Works' : 'কীভাবে কাজ করে'}
                        </h2>
                        <p className="mt-3 max-w-2xl text-muted-foreground">
                            {language === 'en'
                                ? 'Simple steps built for clarity so citizens can complete requests confidently.'
                                : 'সহজ ধাপে তৈরি, যাতে নাগরিকরা আত্মবিশ্বাসের সাথে সেবা সম্পন্ন করতে পারেন।'}
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.title} className="rounded-2xl border border-border/60 bg-card p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                                            <Icon size={20} />
                                        </span>
                                        <span className="text-sm font-semibold text-muted-foreground">0{index + 1}</span>
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="reveal-up reveal-delay-3 bg-secondary/35 py-[4.5rem] md:py-24">
                <div className="container mx-auto px-4 text-center">
                    <div className="mb-16">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <ShieldCheck size={16} /> {t.home.unionName} {t.home.unionSuffix}
                        </div>
                        <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">{t.team.title}</h2>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t.team.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {team.map((member) => (
                            <div key={member._id} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <div className="relative aspect-[4/4] overflow-hidden bg-muted/30">
                                    {member.image ? (
                                        <Image
                                            src={member.image}
                                            alt={member.nameEn}
                                            width={400}
                                            height={400}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                            <span className="text-4xl font-bold opacity-20">{member.nameEn.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 transition-transform duration-300 group-hover:translate-y-0">
                                        <div className="flex justify-center gap-3">
                                            <a href={`tel:${member.phone}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-primary">
                                                <Phone size={18} />
                                            </a>
                                            {member.email && (
                                                <a href={`mailto:${member.email}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-primary">
                                                    <Mail size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="mb-1 truncate text-xl font-bold text-foreground">
                                        {language === 'en' ? member.nameEn : member.nameBn}
                                    </h3>
                                    <p className="mb-3 text-sm font-medium text-primary">{member.designation}</p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <Phone size={14} />
                                        <span>{member.phone}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="reveal-up reveal-delay-3 border-t border-border/60 bg-background py-14 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-8 text-center md:p-10">
                        <h2 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
                            {language === 'en' ? 'Need a Service Right Now?' : 'এখনই কোনো সেবা প্রয়োজন?'}
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                            {language === 'en'
                                ? 'Start your application online and get updates without unnecessary office visits.'
                                : 'অনলাইনে আবেদন শুরু করুন এবং অপ্রয়োজনীয় অফিস ভিজিট ছাড়াই আপডেট পান।'}
                        </p>
                        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link
                                href="/apply/citizen"
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                <CheckCircle2 size={18} />
                                {t.home.registerCitizen}
                            </Link>
                            <Link
                                href="/verify"
                                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 font-semibold text-foreground transition-colors hover:bg-muted/70"
                            >
                                <SearchCheck size={18} />
                                {t.home.checkStatus}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

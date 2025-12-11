'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FileText, UserPlus, ShieldCheck, Mail, Phone } from 'lucide-react';


import { useLanguage } from '@/components/providers/LanguageContext';

export default function PublicHome() {
    const { t, language } = useLanguage();
    const [team, setTeam] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/team')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setTeam(data);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-primary/10 to-background pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        <ShieldCheck size={16} /> {t.common.officialPortal}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-foreground mb-6">
                        {t.home.welcomeTitle} <span className="text-primary">{t.home.unionName}</span> {t.home.unionSuffix}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        {t.home.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/apply/citizen"
                            className="h-12 px-8 rounded-full bg-primary text-white font-medium flex items-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 shadow-lg hover:shadow-primary/25"
                        >
                            <UserPlus size={20} /> {t.home.registerCitizen}
                        </Link>
                        <Link
                            href="/apply/certificate"
                            className="h-12 px-8 rounded-full bg-card border border-border text-foreground font-medium flex items-center gap-2 hover:bg-muted transition-all hover:scale-105"
                        >
                            <FileText size={20} /> {t.home.applyCertificate}
                        </Link>
                        {/* Status Check Link Added */}
                        <Link
                            href="/status"
                            className="h-12 px-8 rounded-full bg-card border border-border text-foreground font-medium flex items-center gap-2 hover:bg-muted transition-all hover:scale-105"
                        >
                            {t.home.checkStatus}
                        </Link>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-card">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/20 transition-all hover:shadow-lg group">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <UserPlus size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{t.home.features.citizenReg.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t.home.features.citizenReg.desc}
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-background border border-border/50 hover:border-emerald-500/20 transition-all hover:shadow-lg group">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{t.home.features.onlineCert.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t.home.features.onlineCert.desc}
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-background border border-border/50 hover:border-amber-500/20 transition-all hover:shadow-lg group">
                            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{t.home.features.verifyDocs.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t.home.features.verifyDocs.desc}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Team Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4 text-center">
                    <div className="mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            <ShieldCheck size={16} /> {t.home.unionName} {t.home.unionSuffix}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground mb-4">
                            {t.team.title}
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                            {t.team.subtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member: any) => (
                            <div key={member._id} className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="aspect-[4/4] relative bg-muted/30 overflow-hidden">
                                    {member.image ? (
                                        <Image
                                            src={member.image}
                                            alt={member.nameEn}
                                            width={400}
                                            height={400}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                                            <span className="text-4xl font-bold opacity-20">{member.nameEn.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent pt-12 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex justify-center gap-3">
                                            <a href={`tel:${member.phone}`} className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors">
                                                <Phone size={18} />
                                            </a>
                                            {member.email && (
                                                <a href={`mailto:${member.email}`} className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors">
                                                    <Mail size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-1 truncate">
                                        {language === 'en' ? member.nameEn : member.nameBn}
                                    </h3>
                                    <p className="text-primary font-medium text-sm mb-3">
                                        {member.designation}
                                    </p>
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
        </div>
    );
}

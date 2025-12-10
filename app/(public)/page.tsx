import Link from 'next/link';
import { ArrowRight, FileText, UserPlus, ShieldCheck } from 'lucide-react';

export default function PublicHome() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-primary/10 to-background pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        <ShieldCheck size={16} /> Official Union Portal
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-foreground mb-6">
                        Welcome to <span className="text-primary">Kalikaccha</span> Union
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        Your digital gateway to union services. Apply for citizenship, get certificates, and pay taxes online—fast, easy, and secure.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/apply/citizen"
                            className="h-12 px-8 rounded-full bg-primary text-white font-medium flex items-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 shadow-lg hover:shadow-primary/25"
                        >
                            <UserPlus size={20} /> Register as Citizen
                        </Link>
                        <Link
                            href="/apply/certificate"
                            className="h-12 px-8 rounded-full bg-card border border-border text-foreground font-medium flex items-center gap-2 hover:bg-muted transition-all hover:scale-105"
                        >
                            <FileText size={20} /> Apply for Certificate
                        </Link>
                        {/* Status Check Link Added */}
                        <Link
                            href="/status"
                            className="h-12 px-8 rounded-full bg-card border border-border text-foreground font-medium flex items-center gap-2 hover:bg-muted transition-all hover:scale-105"
                        >
                            Check Status
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
                            <h3 className="text-xl font-bold mb-3">Citizen Registration</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Become a registered member of our union. Get your unique digital ID and access all services.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-background border border-border/50 hover:border-emerald-500/20 transition-all hover:shadow-lg group">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Online Certificates</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Need a trade license, character certificate, or warish certificate? Apply online and get it delivered.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-background border border-border/50 hover:border-amber-500/20 transition-all hover:shadow-lg group">
                            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Verify Documents</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Instantly verify the authenticity of any certificate issued by our union using our online tool.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

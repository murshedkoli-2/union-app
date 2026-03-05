'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/components/providers/SidebarContext';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar();

    return (
        <div className="flex min-h-screen bg-background font-sans antialiased text-foreground">
            <Sidebar />
            <div
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen",
                    collapsed ? "md:ml-[80px]" : "md:ml-[260px]"
                )}
            >
                <Header />
                <main className="flex-1 overflow-y-auto bg-gradient-to-b from-secondary/35 via-background to-background">
                    <div className="container mx-auto px-4 py-8 md:px-8 md:py-10 max-w-7xl space-y-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div >
    );
}

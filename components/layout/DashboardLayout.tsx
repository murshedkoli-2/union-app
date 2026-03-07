'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/components/providers/SidebarContext';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div
                className={cn(
                    "flex flex-1 flex-col transition-all duration-300 ease-in-out",
                    collapsed ? "md:ml-20" : "md:ml-64"
                )}
            >
                <Header />
                <main className="flex-1 overflow-y-auto bg-background">
                    <div className="container mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

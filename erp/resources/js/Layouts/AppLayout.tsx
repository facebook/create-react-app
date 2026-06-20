import { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { Sidebar } from '@/Components/Layout/Sidebar';
import { Topbar } from '@/Components/Layout/Topbar';
import { useSidebar } from '@/Hooks/useSidebar';
import type { PageProps } from '@/types';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
    const { collapsed, toggle } = useSidebar();
    const { flash } = usePage<PageProps>().props;

    return (
        <>
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar collapsed={collapsed} onToggle={toggle} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar
                    onToggleSidebar={toggle}
                    sidebarCollapsed={collapsed}
                />

                {/* Flash messages */}
                {(flash.success || flash.error) && (
                    <div className="px-6 pt-4">
                        {flash.success && (
                            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                                {flash.success}
                            </div>
                        )}
                        {flash.error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                                {flash.error}
                            </div>
                        )}
                    </div>
                )}

                <main className="flex-1 overflow-y-auto">
                    <div className="px-6 py-6">
                        {title && (
                            <h1 className="mb-6 text-2xl font-bold text-slate-900">
                                {title}
                            </h1>
                        )}
                        {children}
                    </div>
                </main>
            </div>
        </div>
        </>
    );
}

export default AppLayout;

import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    total_pages: number;
    published_pages: number;
    total_posts: number;
    published_posts: number;
    total_menus: number;
}

interface Props extends PageProps {
    stats: Stats;
}

export default function WebsiteDashboard({ stats }: Props) {
    const cards = [
        { label: 'Total Pages',      value: stats.total_pages,      color: 'text-blue-600' },
        { label: 'Published Pages',  value: stats.published_pages,  color: 'text-green-600' },
        { label: 'Total Posts',      value: stats.total_posts,      color: 'text-indigo-600' },
        { label: 'Published Posts',  value: stats.published_posts,  color: 'text-emerald-600' },
        { label: 'Total Menus',      value: stats.total_menus,      color: 'text-purple-600' },
    ];

    const navLinks = [
        { href: '/website/pages',   label: 'Manage Pages' },
        { href: '/website/blog',    label: 'Manage Blog' },
        { href: '/website/menus',   label: 'Manage Menus' },
    ];

    return (
        <AppLayout title="Website Dashboard">
            <Head title="Website Dashboard" />
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-semibold text-slate-900">Website / CMS Dashboard</h1>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {cards.map((card) => (
                        <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-medium uppercase text-slate-500">{card.label}</p>
                            <p className={`mt-2 text-2xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Navigation Links */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

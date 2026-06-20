import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    total: number;
    open: number;
    in_progress: number;
    completed_today: number;
    overdue: number;
}

interface Props extends PageProps {
    stats: Stats;
}

export default function RepairsDashboard({ stats }: Props) {
    const cards = [
        {
            label: 'Total Repairs',
            value: stats.total,
            color: 'text-slate-700',
            href: '/repairs/orders',
            border: 'border-slate-200',
        },
        {
            label: 'Open',
            value: stats.open,
            color: 'text-indigo-600',
            href: '/repairs/orders',
            border: 'border-indigo-200',
        },
        {
            label: 'In Progress',
            value: stats.in_progress,
            color: 'text-amber-600',
            href: '/repairs/orders',
            border: 'border-amber-200',
        },
        {
            label: 'Completed Today',
            value: stats.completed_today,
            color: 'text-green-600',
            href: '/repairs/orders',
            border: 'border-green-200',
        },
    ];

    return (
        <AppLayout>
            <Head title="Repairs Dashboard" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Product Repairs</h1>
                    {stats.overdue > 0 && (
                        <span className="inline-flex items-center rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            {stats.overdue} Overdue
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {cards.map((card) => (
                        <Link
                            key={card.label}
                            href={card.href}
                            className={`rounded-lg border bg-white p-5 shadow-sm hover:shadow-md transition-shadow ${card.border}`}
                        >
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
                            <p className={`mt-2 text-3xl font-bold ${card.color}`}>{card.value}</p>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link
                        href="/repairs/orders"
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm hover:bg-slate-50"
                    >
                        <span className="font-medium text-slate-800">Repair Orders</span>
                        <span className="text-slate-400">&rarr;</span>
                    </Link>
                    <Link
                        href="/repairs/orders"
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm hover:bg-slate-50"
                    >
                        <span className="font-medium text-slate-800">Create New Repair</span>
                        <span className="text-slate-400">+</span>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

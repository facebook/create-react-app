import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    total_equipment: number;
    operational: number;
    open_orders: number;
    overdue_plans: number;
}

interface Props extends PageProps {
    stats: Stats;
}

export default function MaintenanceDashboard({ stats }: Props) {
    const cards = [
        {
            label: 'Total Equipment',
            value: stats.total_equipment,
            color: 'text-slate-700',
            href: '/maintenance/equipment',
            border: 'border-slate-200',
        },
        {
            label: 'Operational',
            value: stats.operational,
            color: 'text-green-600',
            href: '/maintenance/equipment',
            border: 'border-green-200',
        },
        {
            label: 'Open Orders',
            value: stats.open_orders,
            color: 'text-indigo-600',
            href: '/maintenance/orders',
            border: 'border-indigo-200',
        },
        {
            label: 'Overdue Plans',
            value: stats.overdue_plans,
            color: 'text-red-600',
            href: '/maintenance/plans',
            border: 'border-red-200',
        },
    ];

    return (
        <AppLayout>
            <Head title="Maintenance Dashboard" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Equipment Maintenance</h1>
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Link
                        href="/maintenance/equipment"
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm hover:bg-slate-50"
                    >
                        <span className="font-medium text-slate-800">Manage Equipment</span>
                        <span className="text-slate-400">&rarr;</span>
                    </Link>
                    <Link
                        href="/maintenance/orders"
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm hover:bg-slate-50"
                    >
                        <span className="font-medium text-slate-800">Maintenance Orders</span>
                        <span className="text-slate-400">&rarr;</span>
                    </Link>
                    <Link
                        href="/maintenance/plans"
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm hover:bg-slate-50"
                    >
                        <span className="font-medium text-slate-800">Maintenance Plans</span>
                        <span className="text-slate-400">&rarr;</span>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

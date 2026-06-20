import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    openMos: number;
    inProgressMos: number;
    doneMos: number;
    scheduledThisWeek: number;
    efficiency: number;
}

interface RecentMo {
    id: number;
    mo_number: string | null;
    status: string;
    qty_to_produce: number;
    scheduled_date: string | null;
    product: { id: number; name: string };
}

interface WorkCenterStat {
    id: number;
    name: string;
    code: string | null;
    open_work_orders_count: number;
    done_work_orders_count: number;
}

interface Props extends PageProps {
    stats: Stats;
    recentMos: RecentMo[];
    workCenterUtilization: WorkCenterStat[];
}

const statusBadge: Record<string, string> = {
    draft:       'bg-slate-100 text-slate-800',
    confirmed:   'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    done:        'bg-green-100 text-green-800',
    cancelled:   'bg-red-100 text-red-800',
};

export default function ManufacturingDashboard({ stats, recentMos, workCenterUtilization }: Props) {
    const kpiCards = [
        { label: 'Open MOs', value: stats.openMos, color: 'text-blue-600' },
        { label: 'In Progress', value: stats.inProgressMos, color: 'text-yellow-600' },
        { label: 'Done This Month', value: stats.doneMos, color: 'text-green-600' },
        { label: 'Scheduled This Week', value: stats.scheduledThisWeek, color: 'text-indigo-600' },
        { label: 'Avg Efficiency %', value: `${stats.efficiency}%`, color: 'text-purple-600' },
    ];

    return (
        <AppLayout>
            <Head title="Manufacturing Dashboard" />
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">Manufacturing Dashboard</h1>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {kpiCards.map((card) => (
                        <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-medium uppercase text-slate-500">{card.label}</p>
                            <p className={`mt-2 text-2xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent MOs */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-800">Recent Manufacturing Orders</h2>
                            <Link href="/manufacturing/manufacturing-orders" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">MO #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Qty</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Scheduled</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {recentMos.map((mo) => (
                                    <tr key={mo.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium">
                                            <Link href={`/manufacturing/manufacturing-orders/${mo.id}`} className="text-indigo-600 hover:text-indigo-800">
                                                {mo.mo_number ?? `#${mo.id}`}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-900">{mo.product.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[mo.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                                {mo.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{mo.qty_to_produce}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{mo.scheduled_date ?? '—'}</td>
                                    </tr>
                                ))}
                                {recentMos.length === 0 && (
                                    <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">No manufacturing orders yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Work Center Utilization */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-800">Work Center Utilization</h2>
                            <Link href="/manufacturing/work-centers" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Work Center</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Open WOs</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Done WOs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {workCenterUtilization.map((wc) => (
                                    <tr key={wc.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{wc.name}</td>
                                        <td className="px-4 py-3 text-sm text-yellow-600 font-medium">{wc.open_work_orders_count}</td>
                                        <td className="px-4 py-3 text-sm text-green-600 font-medium">{wc.done_work_orders_count}</td>
                                    </tr>
                                ))}
                                {workCenterUtilization.length === 0 && (
                                    <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-500">No work centers yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

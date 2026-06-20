import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Stats {
    pending: number;
    inProgress: number;
    completedToday: number;
    overdue: number;
}

interface TechnicianBreakdown {
    id: number;
    name: string;
    active_orders_count: number;
}

interface RecentOrder {
    id: number;
    order_number: string | null;
    title: string;
    customer_name: string | null;
    priority: string;
    status: string;
    scheduled_at: string | null;
    technician: { id: number; name: string } | null;
}

interface Props extends PageProps {
    stats: Stats;
    technicianBreakdown: TechnicianBreakdown[];
    recentOrders: RecentOrder[];
}

const priorityColors: Record<string, string> = {
    low:    'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
    pending:     'bg-yellow-100 text-yellow-700',
    assigned:    'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    on_hold:     'bg-slate-100 text-slate-700',
    completed:   'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-700',
};

export default function FieldServiceDashboard({ stats, technicianBreakdown, recentOrders }: Props) {
    const kpis = [
        { label: 'Pending',         value: stats.pending,        color: 'text-yellow-600' },
        { label: 'In Progress',     value: stats.inProgress,     color: 'text-indigo-600' },
        { label: 'Completed Today', value: stats.completedToday, color: 'text-green-600' },
        { label: 'Overdue',         value: stats.overdue,        color: 'text-red-600' },
    ];

    return (
        <AppLayout>
            <Head title="Field Service Dashboard" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Field Service Dashboard</h1>
                    <Link href="/field-service/orders/create"><Button>New Order</Button></Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {kpis.map((kpi) => (
                        <div key={kpi.label} className={`rounded-lg border bg-white p-4 shadow-sm ${kpi.label === 'Overdue' ? 'border-red-200' : 'border-slate-200'}`}>
                            <p className="text-xs font-medium uppercase text-slate-500">{kpi.label}</p>
                            <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Technician Workload */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-base font-semibold text-slate-800">Technician Workload</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Technician</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Active Orders</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {technicianBreakdown.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-6 text-center text-sm text-slate-400">No active assignments</td>
                                        </tr>
                                    )}
                                    {technicianBreakdown.map((tech) => (
                                        <tr key={tech.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm font-medium text-slate-800">{tech.name}</td>
                                            <td className="px-4 py-3 text-right text-sm text-slate-700">{tech.active_orders_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h2 className="text-base font-semibold text-slate-800">Recent Orders</h2>
                            <Link href="/field-service/orders" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Order</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Priority</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Scheduled</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Technician</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">No orders yet</td>
                                        </tr>
                                    )}
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm">
                                                <Link href={`/field-service/orders/${order.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                                    {order.order_number ?? `#${order.id}`}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{order.customer_name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[order.priority] ?? priorityColors.medium}`}>
                                                    {order.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] ?? statusColors.pending}`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{order.scheduled_at ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{order.technician?.name ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

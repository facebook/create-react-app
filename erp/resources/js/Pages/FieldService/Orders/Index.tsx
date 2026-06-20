import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
}

interface Order {
    id: number;
    order_number: string | null;
    title: string;
    customer_name: string | null;
    type: string;
    priority: string;
    status: string;
    scheduled_at: string | null;
    technician: User | null;
    total_amount?: number;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props extends PageProps {
    orders: PaginatedOrders;
    filters: { status?: string; priority?: string; assigned_to?: string };
    users: User[];
}

const typeColors: Record<string, string> = {
    installation: 'bg-purple-100 text-purple-700',
    repair:       'bg-red-100 text-red-700',
    maintenance:  'bg-blue-100 text-blue-700',
    inspection:   'bg-teal-100 text-teal-700',
    other:        'bg-slate-100 text-slate-700',
};

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

export default function OrdersIndex({ orders, filters, users }: Props) {
    const handleFilter = (key: string, value: string) => {
        router.get('/field-service/orders', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout>
            <Head title="Service Orders" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Service Orders</h1>
                    <Link href="/field-service/orders/create"><Button>New Order</Button></Link>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <select
                        className="rounded border border-slate-300 px-3 py-1.5 text-sm"
                        value={filters.status ?? ''}
                        onChange={(e) => handleFilter('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {['pending', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'].map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                    </select>
                    <select
                        className="rounded border border-slate-300 px-3 py-1.5 text-sm"
                        value={filters.priority ?? ''}
                        onChange={(e) => handleFilter('priority', e.target.value)}
                    >
                        <option value="">All Priorities</option>
                        {['low', 'medium', 'high', 'urgent'].map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    <select
                        className="rounded border border-slate-300 px-3 py-1.5 text-sm"
                        value={filters.assigned_to ?? ''}
                        onChange={(e) => handleFilter('assigned_to', e.target.value)}
                    >
                        <option value="">All Technicians</option>
                        {users.map((u) => (
                            <option key={u.id} value={String(u.id)}>{u.name}</option>
                        ))}
                    </select>
                </div>

                {/* Orders Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Order #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Priority</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Scheduled</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Technician</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.data.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">No service orders found</td>
                                    </tr>
                                )}
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium">
                                            <Link href={`/field-service/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-800">
                                                {order.order_number ?? `#${order.id}`}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-800">{order.title}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{order.customer_name ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${typeColors[order.type] ?? typeColors.other}`}>
                                                {order.type}
                                            </span>
                                        </td>
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
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">
                                            {order.total_amount != null ? `$${Number(order.total_amount).toFixed(2)}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                            <p className="text-sm text-slate-500">
                                Page {orders.current_page} of {orders.last_page} ({orders.total} total)
                            </p>
                            <div className="flex gap-1">
                                {orders.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`rounded px-2 py-1 text-xs ${link.active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 disabled:opacity-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

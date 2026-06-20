import AppLayout from '@/Layouts/AppLayout';
import { Link, router } from '@inertiajs/react';

interface Order {
    id: number;
    receipt_number: string | null;
    customer_name: string | null;
    session: { id: number; name: string } | null;
    total: number;
    payment_method: string;
    status: string;
    created_at: string;
}

interface PaginatedOrders {
    data: Order[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    orders: PaginatedOrders;
    filters: { status?: string; session_id?: string };
}

const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending:   'bg-yellow-100 text-yellow-800',
    refunded:  'bg-red-100 text-red-800',
    voided:    'bg-slate-100 text-slate-800',
};

export default function OrdersIndex({ orders, filters }: Props) {
    const handleStatusFilter = (status: string) => {
        router.get('/pos/orders', { status: status || undefined }, { preserveState: true });
    };

    return (
        <AppLayout title="POS Orders">
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">POS Orders</h1>
                    <div className="flex items-center gap-2">
                        <select
                            value={filters.status ?? ''}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="refunded">Refunded</option>
                            <option value="voided">Voided</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-lg bg-white shadow-sm border border-slate-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Receipt</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Session</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {orders.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No orders found</td>
                                </tr>
                            )}
                            {orders.data.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                                        <Link href={`/pos/orders/${order.id}`}>
                                            {order.receipt_number ?? `#${order.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{order.customer_name ?? '—'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {order.session ? (
                                            <Link href={`/pos/sessions/${order.session.id}`} className="text-indigo-600 hover:underline">
                                                {order.session.name}
                                            </Link>
                                        ) : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">${order.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700 capitalize">{order.payment_method.replace('_', ' ')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[order.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(order.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex gap-1">
                    {orders.links.map((link, i) => (
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                className={`px-3 py-1.5 text-sm rounded border ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-3 py-1.5 text-sm rounded border border-slate-200 text-slate-400"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

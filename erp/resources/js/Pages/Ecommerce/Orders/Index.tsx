import AppLayout from '@/Layouts/AppLayout';
import { Link, router } from '@inertiajs/react';

interface Order {
    id: number;
    order_number: string | null;
    customer_name: string;
    customer_email: string;
    items_count: number;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    orders: PaginatedOrders;
    filters: {
        status?: string;
        payment_status?: string;
    };
}

const statusColors: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800',
    confirmed:  'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped:    'bg-purple-100 text-purple-800',
    delivered:  'bg-green-100 text-green-800',
    cancelled:  'bg-red-100 text-red-800',
    refunded:   'bg-slate-100 text-slate-800',
};

const paymentColors: Record<string, string> = {
    pending:  'bg-yellow-100 text-yellow-800',
    paid:     'bg-green-100 text-green-800',
    failed:   'bg-red-100 text-red-800',
    refunded: 'bg-slate-100 text-slate-800',
};

export default function OrdersIndex({ orders, filters }: Props) {
    const handleFilter = (key: string, value: string) => {
        router.get('/ecommerce/orders', { ...filters, [key]: value }, { preserveState: true });
    };

    return (
        <AppLayout title="Store Orders">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Store Orders</h1>
                    <span className="text-sm text-slate-500">{orders.total} total</span>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.status ?? ''}
                        onChange={e => handleFilter('status', e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Statuses</option>
                        {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>

                    <select
                        value={filters.payment_status ?? ''}
                        onChange={e => handleFilter('payment_status', e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Payment Statuses</option>
                        {['pending','paid','failed','refunded'].map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Order #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Customer</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Items</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {orders.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">No orders found.</td>
                                </tr>
                            ) : orders.data.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <Link href={`/ecommerce/orders/${order.id}`} className="text-indigo-600 hover:underline">
                                            {order.order_number ?? `#${order.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900">
                                        <div>{order.customer_name}</div>
                                        <div className="text-slate-400 text-xs">{order.customer_email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700 text-right">{order.items_count}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700 text-right">${order.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentColors[order.payment_status] ?? 'bg-slate-100 text-slate-800'}`}>
                                            {order.payment_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <Link href={`/ecommerce/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.last_page > 1 && (
                    <p className="text-sm text-slate-500 text-center">
                        Page {orders.current_page} of {orders.last_page}
                    </p>
                )}
            </div>
        </AppLayout>
    );
}

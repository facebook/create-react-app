import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Link } from '@inertiajs/react';

interface Stats {
    total_orders: number;
    orders_today: number;
    revenue_today: number;
    pending_orders: number;
}

interface TopProduct {
    product_name: string;
    order_count: number;
}

interface RecentOrder {
    id: number;
    order_number: string | null;
    customer_name: string;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
}

interface Props {
    stats: Stats;
    topProducts: TopProduct[];
    recentOrders: RecentOrder[];
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

export default function EcommerceDashboard({ stats, topProducts, recentOrders }: Props) {
    return (
        <AppLayout title="E-commerce Dashboard">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">E-commerce</h1>
                    <Link href="/ecommerce/orders">
                        <Button>View All Orders</Button>
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-5 shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500">Total Orders</p>
                        <p className="mt-1 text-3xl font-bold text-indigo-600">{stats.total_orders}</p>
                    </div>
                    <div className="rounded-lg bg-white p-5 shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500">Today's Orders</p>
                        <p className="mt-1 text-3xl font-bold text-slate-800">{stats.orders_today}</p>
                    </div>
                    <div className="rounded-lg bg-white p-5 shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500">Today's Revenue</p>
                        <p className="mt-1 text-3xl font-bold text-green-600">
                            ${stats.revenue_today.toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-lg bg-white p-5 shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500">Pending Orders</p>
                        <p className="mt-1 text-3xl font-bold text-yellow-600">{stats.pending_orders}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Top Products */}
                    <div className="rounded-lg bg-white shadow-sm border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-base font-semibold text-slate-900">Top Products</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Product</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Qty Sold</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {topProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-4 text-center text-slate-400">No sales yet</td>
                                        </tr>
                                    ) : topProducts.map((p, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4 text-sm text-slate-900">{p.product_name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-700 text-right">{p.order_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="rounded-lg bg-white shadow-sm border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-base font-semibold text-slate-900">Recent Orders</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Customer</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-slate-400">No orders yet</td>
                                        </tr>
                                    ) : recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 text-sm">
                                                <Link href={`/ecommerce/orders/${order.id}`} className="text-indigo-600 hover:underline">
                                                    {order.order_number ?? `#${order.id}`}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{order.customer_name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-700 text-right">${order.total.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
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

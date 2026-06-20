import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Link } from '@inertiajs/react';

interface RecentOrder {
    id: number;
    receipt_number: string | null;
    customer_name: string | null;
    total: number;
    payment_method: string;
    status: string;
    created_at: string;
}

interface Stats {
    open_sessions: number;
    today_sales: number;
    today_orders: number;
    avg_order_value: number;
}

interface Props {
    stats: Stats;
    recentOrders: RecentOrder[];
}

const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending:   'bg-yellow-100 text-yellow-800',
    refunded:  'bg-red-100 text-red-800',
    voided:    'bg-slate-100 text-slate-800',
};

export default function PosDashboard({ stats, recentOrders }: Props) {
    return (
        <AppLayout title="POS Dashboard">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Point of Sale</h1>
                    <Link href="/pos/sessions/create">
                        <Button>Open New Session</Button>
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-5 shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500">Open Sessions</p>
                        <p className="mt-1 text-3xl font-bold text-indigo-600">{stats.open_sessions}</p>
                    </div>
                    <div className="rounded-lg bg-white p-5 shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500">Today's Sales</p>
                        <p className="mt-1 text-3xl font-bold text-green-600">
                            ${stats.today_sales.toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-lg bg-white p-5 shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500">Today's Orders</p>
                        <p className="mt-1 text-3xl font-bold text-slate-800">{stats.today_orders}</p>
                    </div>
                    <div className="rounded-lg bg-white p-5 shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500">Avg Order Value</p>
                        <p className="mt-1 text-3xl font-bold text-slate-800">
                            ${stats.avg_order_value.toFixed(2)}
                        </p>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Receipt</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No recent orders</td>
                                    </tr>
                                )}
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                                            <Link href={`/pos/orders/${order.id}`}>
                                                {order.receipt_number ?? `#${order.id}`}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{order.customer_name ?? '—'}</td>
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
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface LowStockItem {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    reorder_point: number;
}

interface RecentPo {
    id: number;
    status: string;
    supplier: string | null;
    created_at: string;
}

interface Movement {
    date: string;
    type: string;
    total: number;
}

interface Props extends PageProps {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    pendingPoCount: number;
    totalWarehouses: number;
    activeSuppliers: number;
    lowStockItems: LowStockItem[];
    recentPos: RecentPo[];
    movements7d: Movement[];
}

function KpiCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${color ?? 'text-slate-900'}`}>{value}</p>
        </div>
    );
}

const PO_STATUS_COLORS: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-600',
    submitted: 'bg-blue-100 text-blue-700',
    approved:  'bg-violet-100 text-violet-700',
    received:  'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function InventoryDashboard({
    totalProducts, lowStockCount, outOfStockCount, pendingPoCount,
    totalWarehouses, activeSuppliers, lowStockItems, recentPos,
}: Props) {
    return (
        <AppLayout>
            <Head title="Inventory Dashboard" />
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">Inventory Dashboard</h1>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    <KpiCard label="Total Products"   value={totalProducts} />
                    <KpiCard label="Low Stock Items"  value={lowStockCount}   color={lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'} />
                    <KpiCard label="Out of Stock"     value={outOfStockCount} color={outOfStockCount > 0 ? 'text-red-600' : 'text-slate-900'} />
                    <KpiCard label="Pending POs"      value={pendingPoCount}  color={pendingPoCount > 0 ? 'text-blue-600' : 'text-slate-900'} />
                    <KpiCard label="Warehouses"       value={totalWarehouses} />
                    <KpiCard label="Active Suppliers" value={activeSuppliers} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Low Stock Items */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                            <h2 className="text-sm font-semibold text-slate-700">Low Stock Items</h2>
                            <Link href="/inventory/products" className="text-xs text-indigo-600 hover:underline">View all</Link>
                        </div>
                        {lowStockItems.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-400">All stock levels are healthy.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Product</th>
                                        <th className="px-5 py-2 text-right text-xs font-medium text-slate-400">Stock</th>
                                        <th className="px-5 py-2 text-right text-xs font-medium text-slate-400">Reorder At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {lowStockItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3">
                                                <Link href={`/inventory/products/${item.id}`} className="font-medium text-slate-800 hover:text-indigo-600">
                                                    {item.name}
                                                </Link>
                                                <div className="text-xs font-mono text-slate-400">{item.sku}</div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${item.quantity <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-500">{item.reorder_point}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Recent Purchase Orders */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                            <h2 className="text-sm font-semibold text-slate-700">Recent Purchase Orders</h2>
                            <Link href="/inventory/purchase-orders" className="text-xs text-indigo-600 hover:underline">View all</Link>
                        </div>
                        {recentPos.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-400">No purchase orders yet.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">PO #</th>
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Supplier</th>
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Status</th>
                                        <th className="px-5 py-2 text-right text-xs font-medium text-slate-400">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentPos.map((po) => (
                                        <tr key={po.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3">
                                                <Link href={`/inventory/purchase-orders/${po.id}`} className="font-medium text-indigo-600 hover:underline">
                                                    #{po.id}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">{po.supplier ?? '—'}</td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PO_STATUS_COLORS[po.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                    {po.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-500">{po.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface MovementRow {
    id: number;
    product_name: string;
    sku: string;
    warehouse_name: string;
    type: string;
    quantity: number;
    reference: string;
    notes: string;
    created_at: string;
}

interface Summary {
    total_movements: number;
    total_in: number;
    total_out: number;
    net_change: number;
}

interface Product { id: number; name: string; sku: string; }
interface Warehouse { id: number; name: string; }

interface Props extends PageProps {
    rows: MovementRow[];
    summary: Summary;
    products: Product[];
    warehouses: Warehouse[];
    filters: {
        date_from?: string;
        date_to?: string;
        productId?: string | null;
        warehouseId?: string | null;
    };
}

const IN_TYPES  = ['in', 'purchase', 'return', 'adjustment_in', 'transfer_in', 'receipt'];

function TypeBadge({ type }: { type: string }) {
    const isIn = IN_TYPES.includes(type);
    const cls  = isIn
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-red-100 text-red-700';
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
            {type.toUpperCase()}
        </span>
    );
}

export default function StockMovement({ rows, summary, products, warehouses, filters }: Props) {
    const today = new Date().toISOString().split('T')[0];
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [dateFrom, setDateFrom]       = useState(filters.date_from ?? firstDay);
    const [dateTo, setDateTo]           = useState(filters.date_to ?? today);
    const [productId, setProductId]     = useState(filters.productId ?? '');
    const [warehouseId, setWarehouseId] = useState(filters.warehouseId ?? '');

    function applyFilter() {
        router.get('/inventory/reports/stock-movement', {
            date_from:    dateFrom,
            date_to:      dateTo,
            product_id:   productId || undefined,
            warehouse_id: warehouseId || undefined,
        }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Stock Movement Report" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-bold text-slate-900">Stock Movement Report</h1>

                {/* KPI Cards */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Movements</p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{summary.total_movements}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total In</p>
                        <p className="mt-1 text-3xl font-bold text-emerald-600">{summary.total_in.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Out</p>
                        <p className="mt-1 text-3xl font-bold text-red-600">{summary.total_out.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Net Change</p>
                        <p className={`mt-1 text-3xl font-bold ${summary.net_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {summary.net_change >= 0 ? '+' : ''}{summary.net_change.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">Date From</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">Date To</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">Product</label>
                        <select value={productId} onChange={e => setProductId(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">All Products</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">Warehouse</label>
                        <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">All Warehouses</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    <Button onClick={applyFilter}>Apply</Button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Product</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Qty</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Warehouse</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Reference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400">No movements found for the selected filters.</td>
                                    </tr>
                                ) : rows.map(row => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{row.product_name}</div>
                                            <div className="text-xs text-slate-400">{row.sku}</div>
                                        </td>
                                        <td className="px-4 py-3"><TypeBadge type={row.type} /></td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-700">{row.quantity.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-slate-600">{row.created_at.split(' ')[0]}</td>
                                        <td className="px-4 py-3 text-slate-600">{row.warehouse_name}</td>
                                        <td className="px-4 py-3 text-slate-500">{row.reference}</td>
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

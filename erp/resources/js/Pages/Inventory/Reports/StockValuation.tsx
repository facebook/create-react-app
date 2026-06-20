import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface StockRow {
    product_id: number;
    product_name: string;
    sku: string;
    warehouse_id: number;
    warehouse_name: string;
    quantity: number;
    unit_cost: number;
    total_value: number;
}

interface WarehouseSummary {
    warehouse_name: string;
    product_count: number;
    total_qty: number;
    total_value: number;
}

interface Summary {
    total_products: number;
    total_qty: number;
    total_value: number;
    by_warehouse: WarehouseSummary[];
}

interface Warehouse {
    id: number;
    name: string;
}

interface Props extends PageProps {
    rows: StockRow[];
    summary: Summary;
    warehouses: Warehouse[];
    filters: { warehouse_id?: string | null };
}

function fmt(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function StockValuation({ rows, summary, warehouses, filters }: Props) {
    const [warehouseId, setWarehouseId] = useState(filters.warehouse_id ?? '');

    function applyFilter() {
        router.get('/inventory/reports/stock-valuation', { warehouse_id: warehouseId || undefined }, { preserveState: true });
    }

    const totalValue = rows.reduce((s, r) => s + r.total_value, 0);
    const totalQty   = rows.reduce((s, r) => s + r.quantity, 0);

    return (
        <AppLayout>
            <Head title="Stock Valuation Report" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-bold text-slate-900">Stock Valuation Report</h1>

                {/* KPI Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Products</p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{summary.total_products}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Qty</p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{totalQty.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Value</p>
                        <p className="mt-1 text-3xl font-bold text-emerald-600">{fmt(totalValue)}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">Warehouse</label>
                        <select
                            value={warehouseId}
                            onChange={e => setWarehouseId(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
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
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">SKU</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Warehouse</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Qty</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Unit Cost</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Total Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400">No stock data found.</td>
                                    </tr>
                                ) : rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{row.product_name}</td>
                                        <td className="px-4 py-3 text-slate-500">{row.sku}</td>
                                        <td className="px-4 py-3 text-slate-600">{row.warehouse_name}</td>
                                        <td className="px-4 py-3 text-right text-slate-700">{row.quantity.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-slate-700">{fmt(row.unit_cost)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(row.total_value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {rows.length > 0 && (
                                <tfoot className="bg-slate-50">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 font-semibold text-slate-700">Totals</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-900">{totalQty.toLocaleString()}</td>
                                        <td className="px-4 py-3"></td>
                                        <td className="px-4 py-3 text-right font-bold text-emerald-700">{fmt(totalValue)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

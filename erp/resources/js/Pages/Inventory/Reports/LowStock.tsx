import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface LowStockRow {
    product_id: number;
    product_name: string;
    sku: string;
    current_stock: number;
    min_level: number;
    shortage: number;
}

interface Summary {
    products_at_risk: number;
}

interface Props extends PageProps {
    rows: LowStockRow[];
    summary: Summary;
}

function ShortageBadge({ row }: { row: LowStockRow }) {
    if (row.current_stock <= 0) {
        return <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Out of Stock</span>;
    }
    if (row.min_level > 0 && row.shortage > row.min_level * 0.5) {
        return <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">Critical</span>;
    }
    return <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">Low</span>;
}

export default function LowStock({ rows, summary }: Props) {
    return (
        <AppLayout>
            <Head title="Low Stock Report" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-bold text-slate-900">Low Stock Report</h1>

                {/* KPI Card */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
                        <p className="text-sm font-medium text-red-600">Products at Risk</p>
                        <p className="mt-1 text-4xl font-bold text-red-700">{summary.products_at_risk}</p>
                        <p className="mt-1 text-xs text-red-500">Below minimum stock level</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Out of Stock</p>
                        <p className="mt-1 text-4xl font-bold text-slate-900">{rows.filter(r => r.current_stock <= 0).length}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Critical (shortage &gt; 50%)</p>
                        <p className="mt-1 text-4xl font-bold text-orange-600">
                            {rows.filter(r => r.current_stock > 0 && r.min_level > 0 && r.shortage > r.min_level * 0.5).length}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Product</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">SKU</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Current Stock</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Min Level</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Shortage</th>
                                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
                                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-400">All products are at sufficient stock levels.</td>
                                    </tr>
                                ) : rows.map(row => (
                                    <tr key={row.product_id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{row.product_name}</td>
                                        <td className="px-4 py-3 text-slate-500">{row.sku}</td>
                                        <td className={`px-4 py-3 text-right font-medium ${row.current_stock <= 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                            {row.current_stock.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-600">{row.min_level.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-bold text-red-700">{row.shortage.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-center"><ShortageBadge row={row} /></td>
                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                href="/inventory/reorder"
                                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                                            >
                                                Reorder
                                            </Link>
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

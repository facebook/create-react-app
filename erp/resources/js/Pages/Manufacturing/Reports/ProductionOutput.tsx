import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ProductionRow {
    product_id: number;
    product_name: string;
    mo_count: number;
    total_qty: number;
    avg_qty_per_mo: number;
}

interface Props extends PageProps {
    rows: ProductionRow[];
    totalMos: number;
    totalQty: number;
    filters: { from: string; to: string };
}

export default function ProductionOutputReport({ rows, totalMos, totalQty, filters }: Props) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    function handleFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get('/manufacturing/reports/production-output', { from, to }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Production Output Report" />
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">Production Output Report</h1>

                {/* Date Filter */}
                <form onSubmit={handleFilter} className="flex items-end gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">From</label>
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">To</label>
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
                    </div>
                    <Button type="submit">Apply</Button>
                </form>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase text-slate-500">Total MOs (Done)</p>
                        <p className="mt-2 text-2xl font-bold text-indigo-600">{totalMos}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase text-slate-500">Total Qty Produced</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">{totalQty.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase text-slate-500">Unique Products</p>
                        <p className="mt-2 text-2xl font-bold text-purple-600">{rows.length}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">MO Count</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Total Qty Produced</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Avg Qty per MO</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {rows.map((row) => (
                                    <tr key={row.product_id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.product_name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.mo_count}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.total_qty.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.avg_qty_per_mo.toFixed(4)}</td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No completed production orders in this period.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

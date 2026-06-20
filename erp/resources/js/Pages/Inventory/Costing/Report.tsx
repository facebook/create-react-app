import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import type { Product } from '@/types/inventory';

interface ReportRow {
    product: Product;
    average_cost: number;
    layers_count: number;
}

interface Props extends PageProps {
    rows: ReportRow[];
}

export default function CostingReport({ rows }: Props) {
    return (
        <AppLayout>
            <Head title="Costing Report" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Costing Report</h1>
                    <p className="text-sm text-slate-500 mt-1">{rows.length} products</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Product</th>
                                <th className="px-4 py-2 text-left font-medium">SKU</th>
                                <th className="px-4 py-2 text-right font-medium">Average Cost</th>
                                <th className="px-4 py-2 text-right font-medium">Active Layers</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.length === 0 ? (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No data found.</td></tr>
                            ) : rows.map((row) => (
                                <tr key={row.product.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">{row.product.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.product.sku}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{Number(row.average_cost).toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{row.layers_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface BomCostRow {
    id: number;
    product_name: string;
    bom_name: string;
    component_count: number;
    estimated_cost: number;
}

interface Props extends PageProps {
    rows: BomCostRow[];
}

export default function BomCostReport({ rows }: Props) {
    const totalCost = rows.reduce((sum, r) => sum + r.estimated_cost, 0);

    return (
        <AppLayout>
            <Head title="BOM Cost Report" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">BOM Cost Report</h1>
                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm text-sm">
                        <span className="text-slate-500">Total Est. Cost: </span>
                        <span className="font-semibold text-indigo-700">${totalCost.toFixed(4)}</span>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">BOM Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Components</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Est. Total Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.product_name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.bom_name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.component_count}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-indigo-700">${row.estimated_cost.toFixed(4)}</td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No BOMs found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

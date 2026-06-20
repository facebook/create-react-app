import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { CycleCount, CycleCountItem } from '@/types/inventory';

interface CycleCountWithRelations extends CycleCount {
    warehouse?: { id: number; name: string };
    items?: (CycleCountItem & { product?: { id: number; name: string; sku: string } })[];
}

interface Props extends PageProps {
    cycleCount: CycleCountWithRelations;
}

const statusBadge: Record<string, string> = {
    draft:       'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed:   'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-700',
};

export default function CycleCountShow({ cycleCount }: Props) {
    const { can } = usePermission();
    const startForm  = useForm({});
    const completeForm = useForm({});
    const cancelForm = useForm({});

    return (
        <AppLayout>
            <Head title={`Cycle Count ${cycleCount.count_number}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Cycle Count: {cycleCount.count_number}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {cycleCount.warehouse?.name} &middot; {new Date(cycleCount.count_date).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge[cycleCount.status] ?? ''}`}>
                            {cycleCount.status.replace('_', ' ')}
                        </span>
                        <Link href="/inventory/cycle-counts" className="text-sm text-slate-500 hover:text-slate-700">
                            Back to list
                        </Link>
                    </div>
                </div>

                {can('inventory.create') && cycleCount.status === 'draft' && (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => startForm.post(`/inventory/cycle-counts/${cycleCount.id}/start`)}
                            disabled={startForm.processing}
                        >
                            Start Count
                        </Button>
                    </div>
                )}

                {can('inventory.create') && cycleCount.status === 'in_progress' && (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => completeForm.post(`/inventory/cycle-counts/${cycleCount.id}/complete`)}
                            disabled={completeForm.processing}
                        >
                            Complete
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => cancelForm.post(`/inventory/cycle-counts/${cycleCount.id}/cancel`)}
                            disabled={cancelForm.processing}
                        >
                            Cancel
                        </Button>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">SKU</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">System Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Counted Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Variance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(cycleCount.items ?? []).map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 text-sm text-slate-900">{item.product?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm font-mono text-slate-500">{item.product?.sku ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{item.system_qty}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">
                                        {item.counted_qty ?? <span className="text-slate-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        {item.is_counted ? (
                                            <span className={item.variance !== 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                                                {item.variance > 0 ? '+' : ''}{item.variance}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

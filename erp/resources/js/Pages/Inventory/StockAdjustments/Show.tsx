import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { StockAdjustment } from '@/types/inventory';

interface Props extends PageProps {
    stockAdjustment: StockAdjustment;
}

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function StockAdjustmentShow({ stockAdjustment: adj }: Props) {
    const { can } = usePermission();
    const isDraft = adj.status === 'draft';

    function handleConfirm() {
        if (!confirm('Confirm this adjustment? Stock levels will be updated.')) return;
        router.post(`/inventory/stock-adjustments/${adj.id}/confirm`);
    }

    function handleCancel() {
        if (!confirm('Cancel this adjustment?')) return;
        router.post(`/inventory/stock-adjustments/${adj.id}/cancel`);
    }

    function handleDelete() {
        if (!confirm('Delete this adjustment?')) return;
        router.delete(`/inventory/stock-adjustments/${adj.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Adjustment ${adj.reference}`} />
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Stock Adjustment: {adj.reference}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {adj.warehouse?.name ?? '—'} &mdash;{' '}
                            <span className="capitalize">{adj.reason}</span>
                        </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${statusBadge[adj.status] ?? ''}`}>
                        {adj.status}
                    </span>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                            <dt className="text-xs font-medium text-slate-500">Reference</dt>
                            <dd className="mt-1 font-mono text-sm text-slate-900">{adj.reference}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500">Warehouse</dt>
                            <dd className="mt-1 text-sm text-slate-900">{adj.warehouse?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500">Reason</dt>
                            <dd className="mt-1 text-sm text-slate-900 capitalize">{adj.reason}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500">Adjusted By</dt>
                            <dd className="mt-1 text-sm text-slate-900">{adj.adjuster?.name ?? '—'}</dd>
                        </div>
                        {adj.confirmed_at && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Confirmed At</dt>
                                <dd className="mt-1 text-sm text-slate-900">
                                    {new Date(adj.confirmed_at).toLocaleString()}
                                </dd>
                            </div>
                        )}
                        {adj.notes && (
                            <div className="col-span-2">
                                <dt className="text-xs font-medium text-slate-500">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900">{adj.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Items */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base font-medium text-slate-900">Items</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-slate-600">Product</th>
                                <th className="px-6 py-3 text-right font-medium text-slate-600">Expected</th>
                                <th className="px-6 py-3 text-right font-medium text-slate-600">Actual</th>
                                <th className="px-6 py-3 text-right font-medium text-slate-600">Difference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(adj.items ?? []).map((item) => {
                                const diff = Number(item.difference);
                                const diffClass = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-slate-600';
                                return (
                                    <tr key={item.id}>
                                        <td className="px-6 py-3 font-medium text-slate-900">
                                            {item.product?.name ?? '—'}
                                            {item.product?.sku && (
                                                <span className="ml-2 font-mono text-xs text-slate-500">({item.product.sku})</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right text-slate-700">
                                            {Number(item.expected_quantity).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-3 text-right text-slate-700">
                                            {Number(item.actual_quantity).toFixed(2)}
                                        </td>
                                        <td className={`px-6 py-3 text-right font-medium font-mono ${diffClass}`}>
                                            {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!adj.items || adj.items.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-slate-500">
                                        No items.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {isDraft && can('inventory.create') && (
                        <>
                            <Button onClick={handleConfirm} variant="primary">
                                Confirm Adjustment
                            </Button>
                            <Button onClick={handleCancel} variant="secondary">
                                Cancel Adjustment
                            </Button>
                        </>
                    )}
                    {isDraft && can('inventory.delete') && (
                        <Button onClick={handleDelete} variant="danger">
                            Delete
                        </Button>
                    )}
                    <a href="/inventory/stock-adjustments">
                        <Button variant="secondary">Back to List</Button>
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { StockTransfer } from '@/types/inventory';

interface Props extends PageProps {
    stockTransfer: StockTransfer;
}

const statusBadge: Record<string, string> = {
    draft:      'bg-slate-100 text-slate-700',
    in_transit: 'bg-blue-100 text-blue-700',
    completed:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
};

export default function StockTransferShow({ stockTransfer: transfer }: Props) {
    const { can } = usePermission();
    const isDraft = transfer.status === 'draft';

    function handleComplete() {
        if (!confirm('Complete this transfer? Stock levels will be updated.')) return;
        router.post(`/inventory/stock-transfers/${transfer.id}/complete`);
    }

    function handleCancel() {
        if (!confirm('Cancel this transfer?')) return;
        router.post(`/inventory/stock-transfers/${transfer.id}/cancel`);
    }

    function handleDelete() {
        if (!confirm('Delete this transfer?')) return;
        router.delete(`/inventory/stock-transfers/${transfer.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Transfer #${transfer.id}`} />
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Stock Transfer {transfer.reference ? `— ${transfer.reference}` : `#${transfer.id}`}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {transfer.from_warehouse?.name ?? '—'} &rarr; {transfer.to_warehouse?.name ?? '—'}
                        </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${statusBadge[transfer.status] ?? ''}`}>
                        {transfer.status.replace('_', ' ')}
                    </span>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium text-slate-500">From Warehouse</dt>
                            <dd className="mt-1 text-sm text-slate-900">{transfer.from_warehouse?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500">To Warehouse</dt>
                            <dd className="mt-1 text-sm text-slate-900">{transfer.to_warehouse?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge[transfer.status] ?? ''}`}>
                                    {transfer.status.replace('_', ' ')}
                                </span>
                            </dd>
                        </div>
                        {transfer.transferred_at && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Transferred At</dt>
                                <dd className="mt-1 text-sm text-slate-900">
                                    {new Date(transfer.transferred_at).toLocaleString()}
                                </dd>
                            </div>
                        )}
                        {transfer.notes && (
                            <div className="col-span-2">
                                <dt className="text-xs font-medium text-slate-500">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900">{transfer.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Items */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base font-medium text-slate-900">Transfer Items</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-slate-600">Product</th>
                                <th className="px-6 py-3 text-right font-medium text-slate-600">Quantity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(transfer.items ?? []).map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-3 font-medium text-slate-900">
                                        {item.product?.name ?? '—'}
                                        {item.product?.sku && (
                                            <span className="ml-2 font-mono text-xs text-slate-500">({item.product.sku})</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono text-slate-700">
                                        {Number(item.quantity).toFixed(4)}
                                    </td>
                                </tr>
                            ))}
                            {(!transfer.items || transfer.items.length === 0) && (
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-center text-slate-500">
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
                            <Button onClick={handleComplete} variant="primary">
                                Complete Transfer
                            </Button>
                            <Button onClick={handleCancel} variant="secondary">
                                Cancel Transfer
                            </Button>
                        </>
                    )}
                    {isDraft && can('inventory.delete') && (
                        <Button onClick={handleDelete} variant="danger">
                            Delete
                        </Button>
                    )}
                    <a href="/inventory/stock-transfers">
                        <Button variant="secondary">Back to List</Button>
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}

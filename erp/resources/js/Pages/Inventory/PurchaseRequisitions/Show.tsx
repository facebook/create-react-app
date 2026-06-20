import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { PurchaseRequisition } from '@/types/inventory';

interface Props extends PageProps {
    purchaseRequisition: PurchaseRequisition;
}

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
};

export default function PurchaseRequisitionShow({ purchaseRequisition: pr }: Props) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    const isDraft = pr.status === 'draft';
    const isSubmitted = pr.status === 'submitted';

    function handleSubmit() {
        if (!confirm('Submit this requisition for approval?')) return;
        router.post(`/inventory/purchase-requisitions/${pr.id}/submit`);
    }

    function handleApprove() {
        if (!confirm('Approve this requisition?')) return;
        router.post(`/inventory/purchase-requisitions/${pr.id}/approve`);
    }

    function handleReject(e: React.FormEvent) {
        e.preventDefault();
        router.post(`/inventory/purchase-requisitions/${pr.id}/reject`, {
            rejection_reason: rejectionReason,
        });
    }

    function handleDelete() {
        if (!confirm('Delete this requisition?')) return;
        router.delete(`/inventory/purchase-requisitions/${pr.id}`);
    }

    const items = pr.items ?? [];
    const totalCost = items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.estimated_unit_cost),
        0
    );

    return (
        <AppLayout>
            <Head title={`Requisition ${pr.reference}`} />
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Purchase Requisition: {pr.reference}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Requested by {pr.requester?.name ?? '—'}
                        </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${statusBadge[pr.status] ?? ''}`}>
                        {pr.status}
                    </span>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                            <dt className="text-xs font-medium text-slate-500">Reference</dt>
                            <dd className="mt-1 font-mono text-sm text-slate-900">{pr.reference}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500">Status</dt>
                            <dd className="mt-1 text-sm text-slate-900 capitalize">{pr.status}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500">Needed By</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {pr.needed_by ? new Date(pr.needed_by).toLocaleDateString() : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500">Requested By</dt>
                            <dd className="mt-1 text-sm text-slate-900">{pr.requester?.name ?? '—'}</dd>
                        </div>
                        {pr.status === 'approved' && (
                            <>
                                <div>
                                    <dt className="text-xs font-medium text-slate-500">Approved By</dt>
                                    <dd className="mt-1 text-sm text-slate-900">{pr.approver?.name ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-slate-500">Approved At</dt>
                                    <dd className="mt-1 text-sm text-slate-900">
                                        {pr.approved_at ? new Date(pr.approved_at).toLocaleString() : '—'}
                                    </dd>
                                </div>
                            </>
                        )}
                        {pr.notes && (
                            <div className="col-span-2">
                                <dt className="text-xs font-medium text-slate-500">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900">{pr.notes}</dd>
                            </div>
                        )}
                        {pr.status === 'rejected' && pr.rejection_reason && (
                            <div className="col-span-4">
                                <dt className="text-xs font-medium text-red-500">Rejection Reason</dt>
                                <dd className="mt-1 text-sm text-red-700">{pr.rejection_reason}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Items */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base font-medium text-slate-900">Line Items</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-slate-600">Product</th>
                                <th className="px-6 py-3 text-left font-medium text-slate-600">Description</th>
                                <th className="px-6 py-3 text-right font-medium text-slate-600">Qty</th>
                                <th className="px-6 py-3 text-right font-medium text-slate-600">Unit Cost</th>
                                <th className="px-6 py-3 text-right font-medium text-slate-600">Line Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item) => {
                                const lineTotal = Number(item.quantity) * Number(item.estimated_unit_cost);
                                return (
                                    <tr key={item.id}>
                                        <td className="px-6 py-3 text-slate-700">
                                            {item.product ? (
                                                <>
                                                    {item.product.name}
                                                    <span className="ml-2 font-mono text-xs text-slate-500">({item.product.sku})</span>
                                                </>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-slate-700">{item.description}</td>
                                        <td className="px-6 py-3 text-right text-slate-700">
                                            {Number(item.quantity).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-3 text-right text-slate-700">
                                            {Number(item.estimated_unit_cost).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-3 text-right font-medium text-slate-900">
                                            {lineTotal.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                                        No items.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200">
                            <tr>
                                <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-slate-700">
                                    Total Estimated Cost
                                </td>
                                <td className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                                    {totalCost.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Reject form */}
                {isSubmitted && showRejectForm && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
                        <h3 className="text-base font-medium text-red-800 mb-3">Reject Requisition</h3>
                        <form onSubmit={handleReject} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-red-700 mb-1">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    required
                                    rows={3}
                                    className="w-full rounded-md border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    placeholder="Provide a reason for rejection..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" variant="danger">
                                    Confirm Rejection
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => setShowRejectForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                    {isDraft && (
                        <Button onClick={handleSubmit} variant="primary">
                            Submit for Approval
                        </Button>
                    )}
                    {isSubmitted && (
                        <Button onClick={handleApprove} variant="primary">
                            Approve
                        </Button>
                    )}
                    {isSubmitted && !showRejectForm && (
                        <Button onClick={() => setShowRejectForm(true)} variant="danger">
                            Reject
                        </Button>
                    )}
                    {isDraft && (
                        <Button onClick={handleDelete} variant="danger">
                            Delete
                        </Button>
                    )}
                    <a href="/inventory/purchase-requisitions">
                        <Button variant="secondary">Back to List</Button>
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}

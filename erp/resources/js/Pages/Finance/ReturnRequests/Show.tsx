import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ReturnRequest } from '@/types/finance';

interface Props extends PageProps {
    returnRequest: ReturnRequest;
}

type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'refunded';

const STATUS_COLORS: Record<ReturnStatus, string> = {
    pending:  'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800',
};

function StatusBadge({ status }: { status: ReturnStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

export default function ReturnRequestShow({ returnRequest }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (confirm('Delete this return request?')) {
            router.delete(`/finance/return-requests/${returnRequest.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Return Request #${returnRequest.id}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Return Request #{returnRequest.id}</h1>
                        <p className="mt-1 text-sm text-slate-500">{returnRequest.created_at.slice(0, 10)}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/finance/return-requests">
                            <Button variant="secondary">Back</Button>
                        </Link>
                        {can('finance.delete') && (
                            <button
                                onClick={handleDelete}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1"><StatusBadge status={returnRequest.status} /></dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Refund Amount</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900">
                                ${Number(returnRequest.refund_amount).toFixed(2)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Contact</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {returnRequest.contact?.name ?? '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Invoice</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {returnRequest.invoice ? (
                                    <Link href={`/finance/invoices/${returnRequest.invoice_id}`} className="text-indigo-600 hover:text-indigo-800">
                                        #{returnRequest.invoice.number}
                                    </Link>
                                ) : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Total Requested</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900">
                                ${Number(returnRequest.total_requested).toFixed(2)}
                            </dd>
                        </div>
                        {returnRequest.approved_by_user && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Approved By</dt>
                                <dd className="mt-1 text-sm text-slate-900">{returnRequest.approved_by_user.name}</dd>
                            </div>
                        )}
                        {returnRequest.approved_at && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Approved At</dt>
                                <dd className="mt-1 text-sm text-slate-900">{returnRequest.approved_at.slice(0, 10)}</dd>
                            </div>
                        )}
                        {returnRequest.refunded_at && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Refunded At</dt>
                                <dd className="mt-1 text-sm text-slate-900">{returnRequest.refunded_at.slice(0, 10)}</dd>
                            </div>
                        )}
                        <div className="col-span-2">
                            <dt className="text-sm font-medium text-slate-500">Reason</dt>
                            <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{returnRequest.reason}</dd>
                        </div>
                        {returnRequest.notes && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{returnRequest.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Items table */}
                {returnRequest.items && returnRequest.items.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-base font-semibold text-slate-900">Return Items</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-slate-600">Product</th>
                                        <th className="px-4 py-3 font-medium text-slate-600">Qty</th>
                                        <th className="px-4 py-3 font-medium text-slate-600">Unit Price</th>
                                        <th className="px-4 py-3 font-medium text-slate-600">Subtotal</th>
                                        <th className="px-4 py-3 font-medium text-slate-600">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {returnRequest.items.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">{item.product_name}</td>
                                            <td className="px-4 py-3">{item.quantity}</td>
                                            <td className="px-4 py-3">${Number(item.unit_price).toFixed(2)}</td>
                                            <td className="px-4 py-3 font-medium">${(item.quantity * Number(item.unit_price)).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-slate-500">{item.reason ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {can('finance.create') && (returnRequest.status === 'pending' || returnRequest.status === 'approved') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-semibold text-slate-700">Actions</h2>
                        <div className="flex flex-wrap gap-2">
                            {returnRequest.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => router.post(`/finance/return-requests/${returnRequest.id}/approve`)}
                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => router.post(`/finance/return-requests/${returnRequest.id}/reject`)}
                                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {returnRequest.status === 'approved' && (
                                <button
                                    onClick={() => router.post(`/finance/return-requests/${returnRequest.id}/mark-refunded`)}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Mark Refunded
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

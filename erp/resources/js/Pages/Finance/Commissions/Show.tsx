import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Commission } from '@/types/finance';

interface Props extends PageProps {
    commission: Commission;
}

type CommissionStatus = 'pending' | 'approved' | 'paid';

function StatusBadge({ status }: { status: CommissionStatus }) {
    const colors: Record<CommissionStatus, string> = {
        pending:  'bg-amber-100 text-amber-800',
        approved: 'bg-blue-100 text-blue-800',
        paid:     'bg-green-100 text-green-800',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

export default function CommissionShow({ commission }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (confirm('Delete this commission?')) {
            router.delete(`/finance/commissions/${commission.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Commission #${commission.id}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Commission #{commission.id}</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {commission.user?.name} — Invoice {commission.invoice?.number ?? `#${commission.invoice_id}`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/finance/commissions">
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
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1"><StatusBadge status={commission.status} /></dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Sales Rep</dt>
                            <dd className="mt-1 text-sm text-slate-900">{commission.user?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Commission Rule</dt>
                            <dd className="mt-1 text-sm text-slate-900">{commission.rule?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Invoice</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {commission.invoice
                                    ? <Link href={`/finance/invoices/${commission.invoice_id}`} className="text-indigo-600 hover:text-indigo-800">
                                        {commission.invoice.number ?? `#${commission.invoice_id}`}
                                      </Link>
                                    : `#${commission.invoice_id}`}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Invoice Amount</dt>
                            <dd className="mt-1 text-sm text-slate-900">${Number(commission.invoice_amount).toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Commission Amount</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900">${Number(commission.commission_amount).toFixed(2)}</dd>
                        </div>
                        {commission.approved_at && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Approved At</dt>
                                <dd className="mt-1 text-sm text-slate-900">{commission.approved_at}</dd>
                            </div>
                        )}
                        {commission.paid_at && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Paid At</dt>
                                <dd className="mt-1 text-sm text-slate-900">{commission.paid_at}</dd>
                            </div>
                        )}
                        {commission.notes && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900">{commission.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Actions */}
                {can('finance.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-semibold text-slate-700">Actions</h2>
                        <div className="flex flex-wrap gap-2">
                            {commission.status === 'pending' && (
                                <button
                                    onClick={() => router.post(`/finance/commissions/${commission.id}/approve`)}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Approve
                                </button>
                            )}
                            {commission.status === 'approved' && (
                                <button
                                    onClick={() => router.post(`/finance/commissions/${commission.id}/mark-paid`)}
                                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                >
                                    Mark as Paid
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

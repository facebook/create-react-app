import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Subscription } from '@/types/finance';

interface Props extends PageProps {
    subscription: Subscription;
}

type SubscriptionStatus = 'trial' | 'active' | 'paused' | 'cancelled' | 'expired';

function StatusBadge({ status }: { status: SubscriptionStatus }) {
    const colors: Record<SubscriptionStatus, string> = {
        trial: 'bg-blue-100 text-blue-800',
        active: 'bg-green-100 text-green-800',
        paused: 'bg-amber-100 text-amber-800',
        cancelled: 'bg-red-100 text-red-800',
        expired: 'bg-slate-100 text-slate-700',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

export default function SubscriptionShow({ subscription }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (confirm('Delete this subscription?')) {
            router.delete(`/finance/subscriptions/${subscription.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Subscription #${subscription.id}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Subscription #{subscription.id}</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {subscription.contact?.name} — {subscription.plan?.name}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/finance/subscriptions">
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
                            <dd className="mt-1"><StatusBadge status={subscription.status} /></dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Contact</dt>
                            <dd className="mt-1 text-sm text-slate-900">{subscription.contact?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Plan</dt>
                            <dd className="mt-1 text-sm text-slate-900">{subscription.plan?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Billing Cycle</dt>
                            <dd className="mt-1 text-sm text-slate-900 capitalize">{subscription.plan?.billing_cycle ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Started</dt>
                            <dd className="mt-1 text-sm text-slate-900">{subscription.started_at}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Trial Ends</dt>
                            <dd className="mt-1 text-sm text-slate-900">{subscription.trial_ends_at ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Current Period</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {subscription.current_period_start && subscription.current_period_end
                                    ? `${subscription.current_period_start} — ${subscription.current_period_end}`
                                    : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Next Invoice Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{subscription.next_invoice_date ?? '—'}</dd>
                        </div>
                        {subscription.cancelled_at && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Cancelled At</dt>
                                <dd className="mt-1 text-sm text-slate-900">{subscription.cancelled_at}</dd>
                            </div>
                        )}
                        {subscription.notes && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900">{subscription.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Actions */}
                {can('finance.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-semibold text-slate-700">Actions</h2>
                        <div className="flex flex-wrap gap-2">
                            {subscription.status !== 'active' && subscription.status !== 'cancelled' && (
                                <button
                                    onClick={() => router.post(`/finance/subscriptions/${subscription.id}/activate`)}
                                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                >
                                    Activate
                                </button>
                            )}
                            {(subscription.status === 'active' || subscription.status === 'trial') && (
                                <button
                                    onClick={() => router.post(`/finance/subscriptions/${subscription.id}/pause`)}
                                    className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                                >
                                    Pause
                                </button>
                            )}
                            {subscription.status !== 'cancelled' && (
                                <button
                                    onClick={() => {
                                        if (confirm('Cancel this subscription?')) {
                                            router.post(`/finance/subscriptions/${subscription.id}/cancel`);
                                        }
                                    }}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (confirm('Generate invoice for this subscription?')) {
                                        router.post(`/finance/subscriptions/${subscription.id}/generate-invoice`);
                                    }
                                }}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Generate Invoice
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

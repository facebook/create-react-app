import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';

interface SubscriptionPlan {
    id: number;
    name: string;
    billing_cycle: 'monthly' | 'quarterly' | 'annual';
    price: string;
    trial_days: number;
}

interface SubscriptionInvoice {
    id: number;
    amount: string;
    status: 'pending' | 'paid' | 'failed';
    due_date: string;
    paid_at: string | null;
    period_start: string;
    period_end: string;
}

interface Subscription {
    id: number;
    customer_name: string;
    customer_email: string;
    status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
    current_period_start: string;
    current_period_end: string;
    trial_ends_at: string | null;
    cancelled_at: string | null;
    notes: string | null;
    plan: SubscriptionPlan | null;
    invoices: SubscriptionInvoice[];
}

interface Props {
    subscription: Subscription;
}

const STATUS_BADGES: Record<string, string> = {
    trial:    'bg-purple-100 text-purple-700',
    active:   'bg-green-100 text-green-700',
    past_due: 'bg-orange-100 text-orange-700',
    cancelled:'bg-red-100 text-red-700',
    expired:  'bg-gray-100 text-gray-700',
};

const INVOICE_BADGES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid:    'bg-green-100 text-green-700',
    failed:  'bg-red-100 text-red-700',
};

export default function SubscriptionShow({ subscription }: Props) {
    function handleCancel() {
        if (confirm('Cancel this subscription?')) {
            router.post(`/subscriptions/${subscription.id}/cancel`);
        }
    }

    function handleRenew() {
        router.post(`/subscriptions/${subscription.id}/renew`);
    }

    function handlePayInvoice(invoiceId: number) {
        router.post(`/subscriptions/${subscription.id}/invoices/${invoiceId}/pay`);
    }

    const canCancel = ['active', 'trial'].includes(subscription.status);
    const canRenew  = subscription.status === 'active';

    return (
        <AppLayout>
            <Head title={`Subscription — ${subscription.customer_name}`} />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <a href="/subscriptions" className="text-sm text-blue-600 hover:underline">&larr; Back to Subscriptions</a>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-800">{subscription.customer_name}</h1>
                        <p className="text-sm text-slate-500">{subscription.customer_email}</p>
                    </div>
                    <div className="flex gap-2">
                        {canRenew && (
                            <Button onClick={handleRenew}>Renew</Button>
                        )}
                        {canCancel && (
                            <button
                                onClick={handleCancel}
                                className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-800">Subscription Details</h2>
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[subscription.status] ?? ''}`}>
                                    {subscription.status.replace('_', ' ')}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Plan</dt>
                            <dd className="mt-1 text-sm font-medium text-slate-800">{subscription.plan?.name ?? '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Billing Cycle</dt>
                            <dd className="mt-1 text-sm text-slate-700 capitalize">{subscription.plan?.billing_cycle ?? '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Price</dt>
                            <dd className="mt-1 text-sm text-slate-700">${subscription.plan?.price ?? '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Period Start</dt>
                            <dd className="mt-1 text-sm text-slate-700">{subscription.current_period_start}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Period End</dt>
                            <dd className="mt-1 text-sm text-slate-700">{subscription.current_period_end}</dd>
                        </div>
                        {subscription.trial_ends_at && (
                            <div>
                                <dt className="text-xs text-slate-500">Trial Ends</dt>
                                <dd className="mt-1 text-sm text-slate-700">{subscription.trial_ends_at}</dd>
                            </div>
                        )}
                        {subscription.cancelled_at && (
                            <div>
                                <dt className="text-xs text-slate-500">Cancelled At</dt>
                                <dd className="mt-1 text-sm text-slate-700">{subscription.cancelled_at}</dd>
                            </div>
                        )}
                        {subscription.notes && (
                            <div className="col-span-2 sm:col-span-3">
                                <dt className="text-xs text-slate-500">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-700">{subscription.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Invoices */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-800">Invoices</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Period</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Amount</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Due Date</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {subscription.invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No invoices.</td>
                                    </tr>
                                ) : (
                                    subscription.invoices.map(inv => (
                                        <tr key={inv.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-600">
                                                {inv.period_start} &mdash; {inv.period_end}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800">${inv.amount}</td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${INVOICE_BADGES[inv.status] ?? ''}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{inv.due_date}</td>
                                            <td className="px-4 py-3">
                                                {inv.status === 'pending' && (
                                                    <button
                                                        onClick={() => handlePayInvoice(inv.id)}
                                                        className="rounded bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100"
                                                    >
                                                        Pay
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

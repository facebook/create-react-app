import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { SubscriptionPlan } from '@/types/finance';

interface Props extends PageProps {
    plan: SubscriptionPlan;
}

export default function SubscriptionPlanShow({ plan }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (confirm('Delete this subscription plan?')) {
            router.delete(`/finance/subscription-plans/${plan.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Plan: ${plan.name}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{plan.name}</h1>
                        <p className="mt-1 text-sm text-slate-500">Subscription Plan</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/finance/subscription-plans">
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

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Name</dt>
                            <dd className="mt-1 text-sm text-slate-900">{plan.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Billing Cycle</dt>
                            <dd className="mt-1 text-sm text-slate-900 capitalize">{plan.billing_cycle}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Price</dt>
                            <dd className="mt-1 text-sm text-slate-900">{plan.currency_code} {Number(plan.price).toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Trial Days</dt>
                            <dd className="mt-1 text-sm text-slate-900">{plan.trial_days > 0 ? `${plan.trial_days} days` : 'No trial'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                    {plan.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Subscriptions</dt>
                            <dd className="mt-1 text-sm text-slate-900">{plan.subscriptions_count ?? 0}</dd>
                        </div>
                        {plan.description && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Description</dt>
                                <dd className="mt-1 text-sm text-slate-900">{plan.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                <div className="flex gap-2">
                    {can('finance.create') && (
                        <Link href="/finance/subscriptions/create">
                            <Button>New Subscription with this Plan</Button>
                        </Link>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

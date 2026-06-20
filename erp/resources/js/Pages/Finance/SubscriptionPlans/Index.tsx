import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { SubscriptionPlan } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    plans: Paginator<SubscriptionPlan>;
}

const CYCLE_LABELS: Record<string, string> = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    annually: 'Annually',
};

function CycleBadge({ cycle }: { cycle: string }) {
    const colors: Record<string, string> = {
        monthly: 'bg-blue-100 text-blue-800',
        quarterly: 'bg-purple-100 text-purple-800',
        annually: 'bg-indigo-100 text-indigo-800',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[cycle] ?? 'bg-slate-100 text-slate-700'}`}>
            {CYCLE_LABELS[cycle] ?? cycle}
        </span>
    );
}

export default function SubscriptionPlansIndex({ plans }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Subscription Plans" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Subscription Plans</h1>
                        <p className="mt-1 text-sm text-slate-500">{plans.total} plans</p>
                    </div>
                    {can('finance.create') && (
                        <Link href="/finance/subscription-plans/create">
                            <Button>New Plan</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'name', header: 'Name', render: (plan) => (
                                    <Link href={`/finance/subscription-plans/${plan.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                        {plan.name}
                                    </Link>
                                ),
                            },
                            { key: 'billing_cycle', header: 'Billing Cycle', render: (plan) => <CycleBadge cycle={plan.billing_cycle} /> },
                            { key: 'price', header: 'Price', render: (plan) => `${plan.currency_code} ${Number(plan.price).toFixed(2)}` },
                            { key: 'trial_days', header: 'Trial Days', render: (plan) => plan.trial_days > 0 ? `${plan.trial_days} days` : '—' },
                            { key: 'subscriptions_count', header: 'Subscriptions', render: (plan) => plan.subscriptions_count ?? 0 },
                            {
                                key: 'is_active', header: 'Active', render: (plan) => (
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                        {plan.is_active ? 'Yes' : 'No'}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions', header: '', render: (plan) => (
                                    <div className="flex items-center gap-2">
                                        <Link href={`/finance/subscription-plans/${plan.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View</Link>
                                        {can('finance.delete') && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this plan?')) {
                                                        router.delete(`/finance/subscription-plans/${plan.id}`);
                                                    }
                                                }}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={plans.data}
                        emptyMessage="No subscription plans found."
                    />
                    <Pagination paginator={plans} />
                </div>
            </div>
        </AppLayout>
    );
}

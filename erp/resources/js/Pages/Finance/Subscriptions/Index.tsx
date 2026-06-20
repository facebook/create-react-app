import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Subscription } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    subscriptions: Paginator<Subscription>;
    filters: { status?: string };
}

type SubscriptionStatus = 'trial' | 'active' | 'paused' | 'cancelled' | 'expired';

const STATUS_TABS: Array<{ value: SubscriptionStatus | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'trial', label: 'Trial' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
];

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

export default function SubscriptionsIndex({ subscriptions, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/finance/subscriptions', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Subscriptions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Subscriptions</h1>
                        <p className="mt-1 text-sm text-slate-500">{subscriptions.total} subscriptions</p>
                    </div>
                    {can('finance.create') && (
                        <Link href="/finance/subscriptions/create">
                            <Button>New Subscription</Button>
                        </Link>
                    )}
                </div>

                {/* Status tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatus(tab.value)}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                (filters.status ?? '') === tab.value
                                    ? 'border-indigo-600 text-indigo-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            ].join(' ')}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'contact', header: 'Contact', render: (sub) => (
                                    <Link href={`/finance/subscriptions/${sub.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                        {sub.contact?.name ?? '—'}
                                    </Link>
                                ),
                            },
                            { key: 'plan', header: 'Plan', render: (sub) => sub.plan?.name ?? '—' },
                            { key: 'status', header: 'Status', render: (sub) => <StatusBadge status={sub.status} /> },
                            { key: 'started_at', header: 'Started', render: (sub) => sub.started_at },
                            { key: 'next_invoice_date', header: 'Next Invoice', render: (sub) => sub.next_invoice_date ?? '—' },
                            {
                                key: 'actions', header: '', render: (sub) => (
                                    <Link href={`/finance/subscriptions/${sub.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={subscriptions.data}
                        emptyMessage="No subscriptions found."
                    />
                    <Pagination paginator={subscriptions} />
                </div>
            </div>
        </AppLayout>
    );
}

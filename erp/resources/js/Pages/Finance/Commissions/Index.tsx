import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Commission } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface User { id: number; name: string; }

interface Props extends PageProps {
    commissions: Paginator<Commission>;
    users: User[];
    filters: { status?: string; user_id?: number };
}

type CommissionStatus = 'pending' | 'approved' | 'paid';

const STATUS_TABS: Array<{ value: CommissionStatus | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'paid', label: 'Paid' },
];

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

export default function CommissionsIndex({ commissions, users, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/finance/commissions', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    function setUser(userId: string) {
        router.get('/finance/commissions', { ...filters, user_id: userId || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Commissions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Commissions</h1>
                        <p className="mt-1 text-sm text-slate-500">{commissions.total} commissions</p>
                    </div>
                    <div className="flex gap-2">
                        {can('finance.create') && (
                            <>
                                <Link href="/finance/commissions/create">
                                    <Button variant="secondary">New Commission</Button>
                                </Link>
                            </>
                        )}
                    </div>
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

                {/* User filter */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700">Filter by rep:</label>
                    <select
                        value={filters.user_id ?? ''}
                        onChange={(e) => setUser(e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                    >
                        <option value="">All reps</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'user',
                                header: 'Sales Rep',
                                render: (c) => (
                                    <Link href={`/finance/commissions/${c.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                        {c.user?.name ?? '—'}
                                    </Link>
                                ),
                            },
                            {
                                key: 'invoice',
                                header: 'Invoice #',
                                render: (c) => c.invoice?.number ?? `#${c.invoice_id}`,
                            },
                            {
                                key: 'invoice_amount',
                                header: 'Invoice Amount',
                                render: (c) => `$${Number(c.invoice_amount).toFixed(2)}`,
                            },
                            {
                                key: 'commission_amount',
                                header: 'Commission',
                                render: (c) => `$${Number(c.commission_amount).toFixed(2)}`,
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (c) => <StatusBadge status={c.status} />,
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (c) => (
                                    <Link href={`/finance/commissions/${c.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={commissions.data}
                        emptyMessage="No commissions found."
                    />
                    <Pagination paginator={commissions} />
                </div>
            </div>
        </AppLayout>
    );
}

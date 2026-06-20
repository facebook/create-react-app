import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { ExpenseClaim } from '@/types/hr';

interface Props extends PageProps {
    claims: Paginator<ExpenseClaim>;
    filters: { status?: string };
}

const STATUS_COLORS: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    submitted: 'bg-yellow-100 text-yellow-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
    paid:      'bg-blue-100 text-blue-700',
};

const STATUS_TABS = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' },
];

export default function ExpenseClaimsIndex({ claims, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/hr/expense-claims', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Expense Claims" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Expense Claims</h1>
                        <p className="text-sm text-slate-500 mt-1">{claims.total} claims</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/expense-claims/create">
                            <Button>New Expense Claim</Button>
                        </Link>
                    )}
                </div>

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
                                key: 'employee',
                                header: 'Employee',
                                render: (r) => (
                                    <span className="font-medium text-slate-900">
                                        {r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'title',
                                header: 'Title',
                                render: (r) => <span className="text-sm text-slate-700">{r.title}</span>,
                            },
                            {
                                key: 'total_amount',
                                header: 'Total Amount',
                                render: (r) => (
                                    <span className="text-sm font-medium text-slate-900">
                                        ${Number(r.total_amount).toFixed(2)}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (r) => (
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                        {r.status}
                                    </span>
                                ),
                            },
                            {
                                key: 'created_at',
                                header: 'Date',
                                render: (r) => <span className="text-sm text-slate-500">{r.created_at?.slice(0, 10)}</span>,
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (r) => (
                                    <Link href={`/hr/expense-claims/${r.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={claims.data}
                        emptyMessage="No expense claims found."
                    />
                    <Pagination paginator={claims} />
                </div>
            </div>
        </AppLayout>
    );
}

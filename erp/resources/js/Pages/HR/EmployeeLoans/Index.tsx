import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { EmployeeLoan } from '@/types/hr';

interface Props extends PageProps {
    loans: Paginator<EmployeeLoan>;
    filters: { status?: string };
}

type LoanStatus = 'pending' | 'active' | 'completed' | 'cancelled';

const STATUS_TABS: Array<{ value: LoanStatus | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

function StatusBadge({ status }: { status: LoanStatus }) {
    const classes: Record<LoanStatus, string> = {
        pending:   'bg-amber-100 text-amber-800',
        active:    'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${classes[status]}`}>
            {status}
        </span>
    );
}

function TypeBadge({ type }: { type: 'loan' | 'advance' }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${type === 'loan' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'}`}>
            {type}
        </span>
    );
}

export default function EmployeeLoansIndex({ loans, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/hr/employee-loans', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Loans & Advances" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Loans & Advances</h1>
                        <p className="text-sm text-slate-500 mt-1">{loans.total} records</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/employee-loans/create">
                            <Button>New Loan</Button>
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
                                key: 'employee',
                                header: 'Employee',
                                render: (r) => (
                                    <Link href={`/hr/employee-loans/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {r.employee?.full_name ?? '—'}
                                    </Link>
                                ),
                            },
                            {
                                key: 'type',
                                header: 'Type',
                                render: (r) => <TypeBadge type={r.type} />,
                            },
                            {
                                key: 'amount',
                                header: 'Amount',
                                render: (r) => (
                                    <span className="text-sm font-medium text-slate-900">
                                        {Number(r.amount).toFixed(2)}
                                    </span>
                                ),
                            },
                            {
                                key: 'outstanding_balance',
                                header: 'Outstanding',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">
                                        {Number(r.outstanding_balance).toFixed(2)}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (r) => <StatusBadge status={r.status} />,
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (r) => (
                                    <Link href={`/hr/employee-loans/${r.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={loans.data}
                        emptyMessage="No loans or advances found."
                    />
                    <Pagination paginator={loans} />
                </div>
            </div>
        </AppLayout>
    );
}

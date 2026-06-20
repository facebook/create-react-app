import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { EmployeeExit } from '@/types/hr';

interface Props extends PageProps {
    exits: Paginator<EmployeeExit>;
    filters: { status?: string };
}

type ExitStatus = 'pending' | 'in_progress' | 'completed';

const STATUS_TABS: Array<{ value: ExitStatus | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

function StatusBadge({ status }: { status: string }) {
    const classes: Record<string, string> = {
        pending:     'bg-amber-100 text-amber-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed:   'bg-green-100 text-green-800',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${classes[status] ?? 'bg-slate-100 text-slate-800'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

export default function EmployeeExitsIndex({ exits, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/hr/employee-exits', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Exit Management" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Exit Management</h1>
                        <p className="text-sm text-slate-500 mt-1">{exits.total} records</p>
                    </div>
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
                                    <Link href={`/hr/employee-exits/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '—'}
                                    </Link>
                                ),
                            },
                            {
                                key: 'exit_type',
                                header: 'Exit Type',
                                render: (r) => (
                                    <span className="capitalize text-sm text-slate-700">{r.exit_type.replace('_', ' ')}</span>
                                ),
                            },
                            {
                                key: 'exit_date',
                                header: 'Exit Date',
                                render: (r) => <span className="text-sm text-slate-700">{r.exit_date}</span>,
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
                                    <Link href={`/hr/employee-exits/${r.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={exits.data}
                        emptyMessage="No exit records found."
                    />
                    <Pagination paginator={exits} />
                </div>
            </div>
        </AppLayout>
    );
}

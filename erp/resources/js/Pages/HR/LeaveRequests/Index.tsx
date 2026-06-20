import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { LeaveStatusBadge } from '@/Components/HR/LeaveStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { LeaveRequest, LeaveStatus } from '@/types/hr';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    requests: Paginator<LeaveRequest>;
    employees: { id: number; full_name: string }[];
    filters: { status?: LeaveStatus; employee_id?: number };
}

const STATUS_TABS: Array<{ value: LeaveStatus | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

export default function LeaveRequestsIndex({ requests, employees, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/hr/leave-requests', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Leave Requests" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Leave Requests</h1>
                        <p className="text-sm text-slate-500 mt-1">{requests.total} requests</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/leave-requests/create"><Button>New Request</Button></Link>
                    )}
                </div>

                {/* Status tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    {STATUS_TABS.map((tab) => (
                        <button key={tab.value}
                            onClick={() => setStatus(tab.value)}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                (filters.status ?? '') === tab.value
                                    ? 'border-indigo-600 text-indigo-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            ].join(' ')}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                        <select value={filters.employee_id ?? ''}
                            onChange={(e) => router.get('/hr/leave-requests', { ...filters, employee_id: e.target.value || undefined }, { preserveState: true, replace: true })}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">All Employees</option>
                            {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'employee', header: 'Employee', render: (r) => (
                                <Link href={`/hr/leave-requests/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                    {r.employee?.full_name ?? '—'}
                                </Link>
                            )},
                            { key: 'type', header: 'Type', render: (r) => (
                                <span className="text-sm text-slate-700 capitalize">{r.leave_type ?? r.type ?? '—'}</span>
                            )},
                            { key: 'period', header: 'Period', render: (r) => (
                                <span className="text-sm text-slate-500">{r.start_date} → {r.end_date}</span>
                            )},
                            { key: 'days', header: 'Days', render: (r) => <span className="text-sm">{r.days}</span> },
                            { key: 'status', header: 'Status', render: (r) => <LeaveStatusBadge status={r.status} /> },
                            { key: 'actions', header: '', render: (r) => (
                                <Link href={`/hr/leave-requests/${r.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View</Link>
                            )},
                        ]}
                        data={requests.data}
                        emptyMessage="No leave requests found."
                    />
                    <Pagination paginator={requests} />
                </div>
            </div>
        </AppLayout>
    );
}

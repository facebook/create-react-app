import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { Timesheet } from '@/types/hr';

interface Props extends PageProps {
    timesheets: Paginator<Timesheet>;
    employees: { id: number; first_name: string; last_name: string }[];
    filters: { employee_id?: string; status?: string };
}

const STATUS_COLORS: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
};

export default function TimesheetsIndex({ timesheets, employees, filters }: Props) {
    const { can } = usePermission();

    function applyFilter(key: string, value: string) {
        router.get('/hr/timesheets', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Timesheets" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Timesheets</h1>
                        <p className="text-sm text-slate-500 mt-1">{timesheets.total} timesheets</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/timesheets/create">
                            <Button>New Timesheet</Button>
                        </Link>
                    )}
                </div>

                {/* Filter bar */}
                <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Employee</label>
                        <select
                            value={filters.employee_id ?? ''}
                            onChange={(e) => applyFilter('employee_id', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Employees</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                        <select
                            value={filters.status ?? ''}
                            onChange={(e) => applyFilter('status', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'employee',
                                header: 'Employee',
                                render: (r) => (
                                    <span className="text-slate-900">
                                        {r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'week',
                                header: 'Week',
                                render: (r) => (
                                    <span className="text-slate-700">
                                        {r.week_start} &mdash; {r.week_end}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (r) => (
                                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                        {r.status}
                                    </span>
                                ),
                            },
                            {
                                key: 'total_hours',
                                header: 'Total Hours',
                                render: (r) => <span className="text-slate-700">{r.total_hours}h</span>,
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (r) => (
                                    <Link href={`/hr/timesheets/${r.id}`} className="text-indigo-600 hover:underline text-sm font-medium">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        rows={timesheets.data}
                    />
                </div>

                <Pagination paginator={timesheets} />
            </div>
        </AppLayout>
    );
}

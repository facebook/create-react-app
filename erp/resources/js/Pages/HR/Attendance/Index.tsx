import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { AttendanceRecord, Employee } from '@/types/hr';

interface Props extends PageProps {
    records: Paginator<AttendanceRecord>;
    employees: Pick<Employee, 'id' | 'first_name' | 'last_name'>[];
}

const STATUS_COLORS: Record<string, string> = {
    present:  'bg-green-100 text-green-700',
    absent:   'bg-red-100 text-red-700',
    half_day: 'bg-amber-100 text-amber-700',
    holiday:  'bg-blue-100 text-blue-700',
    leave:    'bg-purple-100 text-purple-700',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

export default function AttendanceIndex({ records, employees }: Props) {
    const { can } = usePermission();
    const params = new URLSearchParams(window.location.search);
    const employeeId = params.get('employee_id') ?? '';
    const month = params.get('month') ?? '';

    function applyFilter(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const q: Record<string, string> = {};
        const emp = fd.get('employee_id') as string;
        const mo  = fd.get('month') as string;
        if (emp) q.employee_id = emp;
        if (mo)  q.month = mo;
        router.get('/hr/attendance', q, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Attendance" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>
                        <p className="text-sm text-slate-500 mt-1">{records.total} records</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/attendance/create">
                            <Button>Log Attendance</Button>
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <form onSubmit={applyFilter} className="flex items-end gap-3 flex-wrap">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Employee</label>
                        <select
                            name="employee_id"
                            defaultValue={employeeId}
                            className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        >
                            <option value="">All employees</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Month</label>
                        <input
                            type="month"
                            name="month"
                            defaultValue={month}
                            className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <Button type="submit">Filter</Button>
                </form>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'employee',
                                header: 'Employee',
                                render: (r) => (
                                    <Link href={`/hr/attendance/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '—'}
                                    </Link>
                                ),
                            },
                            {
                                key: 'work_date',
                                header: 'Date',
                                render: (r) => <span className="text-sm text-slate-700">{r.work_date}</span>,
                            },
                            {
                                key: 'clock_in',
                                header: 'Clock In',
                                render: (r) => <span className="text-sm text-slate-700">{r.clock_in ?? '—'}</span>,
                            },
                            {
                                key: 'clock_out',
                                header: 'Clock Out',
                                render: (r) => <span className="text-sm text-slate-700">{r.clock_out ?? '—'}</span>,
                            },
                            {
                                key: 'worked_hours',
                                header: 'Worked Hours',
                                render: (r) => (
                                    <span className="text-sm text-slate-700">
                                        {r.worked_hours != null ? `${r.worked_hours}h` : '—'}
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
                                    <Link href={`/hr/attendance/${r.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={records.data}
                        emptyMessage="No attendance records found."
                    />
                    <Pagination paginator={records} />
                </div>
            </div>
        </AppLayout>
    );
}

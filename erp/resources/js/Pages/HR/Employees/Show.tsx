import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { EmployeeStatusBadge } from '@/Components/HR/EmployeeStatusBadge';
import { LeaveStatusBadge } from '@/Components/HR/LeaveStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Employee, LeaveRequest } from '@/types/hr';

interface Props extends PageProps {
    employee: Employee;
    leaveRequests?: LeaveRequest[];
}

const EMPLOYMENT_LABELS: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract:  'Contract',
    intern:    'Intern',
};

export default function EmployeeShow({ employee, leaveRequests = [] }: Props) {
    const { can } = usePermission();

    function handleTerminate() {
        if (!confirm(`Terminate employee ${employee.full_name}? This action sets their status to terminated.`)) return;
        router.post(`/hr/employees/${employee.id}/terminate`);
    }

    return (
        <AppLayout>
            <Head title={employee.full_name} />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{employee.full_name}</h1>
                        <div className="mt-1 flex items-center gap-3">
                            <EmployeeStatusBadge status={employee.status} />
                            {(employee.code || employee.employee_number) && (
                                <span className="font-mono text-sm text-slate-400">
                                    {employee.code ?? employee.employee_number}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {can('hr.update') && employee.status === 'active' && (
                            <Button variant="secondary" onClick={handleTerminate}>
                                Terminate
                            </Button>
                        )}
                        {can('hr.update') && (
                            <Link href={`/hr/employees/${employee.id}/edit`}>
                                <Button variant="secondary">Edit</Button>
                            </Link>
                        )}
                        {can('hr.create') && (
                            <Link href={`/hr/leave-requests/create`}>
                                <Button>New Leave Request</Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Employee Details</h2>
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                        {[
                            { label: 'Position',        value: employee.position ?? employee.job_title ?? '—' },
                            { label: 'Department',      value: employee.department?.name ?? '—' },
                            { label: 'Employment Type', value: EMPLOYMENT_LABELS[employee.employment_type] ?? employee.employment_type },
                            { label: 'Email',           value: employee.email ?? '—' },
                            { label: 'Phone',           value: employee.phone ?? '—' },
                            { label: 'Hire Date',       value: employee.hire_date ?? employee.start_date ?? '—' },
                            { label: 'Termination Date', value: employee.termination_date ?? employee.end_date ?? '—' },
                            { label: 'Salary',          value: `${Number(employee.salary_amount ?? employee.salary ?? 0).toLocaleString()}` },
                            { label: 'Linked User',     value: employee.user?.name ?? '—' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <dt className="text-xs text-slate-500">{label}</dt>
                                <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                {/* Leave history */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex justify-between items-center">
                        <h2 className="text-sm font-medium text-slate-700">Leave History</h2>
                    </div>
                    {leaveRequests.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-400 text-center">No leave requests.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Type</th>
                                    <th className="px-4 py-2 text-left font-medium">Period</th>
                                    <th className="px-4 py-2 text-right font-medium">Days</th>
                                    <th className="px-4 py-2 text-left font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaveRequests.map((lr) => (
                                    <tr key={lr.id}>
                                        <td className="px-4 py-3">{lr.leave_type ?? lr.type ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-500">{lr.start_date} → {lr.end_date}</td>
                                        <td className="px-4 py-3 text-right">{lr.days}</td>
                                        <td className="px-4 py-3">
                                            <LeaveStatusBadge status={lr.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

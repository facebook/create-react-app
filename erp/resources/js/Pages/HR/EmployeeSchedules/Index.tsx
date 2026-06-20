import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { Employee, WorkSchedule, EmployeeSchedule } from '@/types/hr';

interface Props extends PageProps {
    assignments: Paginator<EmployeeSchedule>;
    filters: { employee_id?: string };
    employees?: Employee[];
    workSchedules?: WorkSchedule[];
}

export default function EmployeeSchedulesIndex({ assignments, filters, employees = [], workSchedules = [] }: Props) {
    const { can } = usePermission();
    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: '',
        work_schedule_id: '',
        effective_from: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/employee-schedules', { onSuccess: () => reset() });
    }

    function handleDelete(id: number) {
        if (confirm('Remove this schedule assignment?')) {
            router.delete(`/hr/employee-schedules/${id}`);
        }
    }

    function filterByEmployee(value: string) {
        router.get('/hr/employee-schedules', { employee_id: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Employee Schedules" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Employee Schedules</h1>
                        <p className="text-sm text-slate-500 mt-1">{assignments.total} assignment{assignments.total !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Filter by employee */}
                <div className="flex gap-3 items-center">
                    <label className="text-sm text-slate-600">Filter by Employee:</label>
                    <select
                        value={filters.employee_id ?? ''}
                        onChange={(e) => filterByEmployee(e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Employees</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Assign Form */}
                {can('hr.create') && (
                    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900 mb-3">Assign Schedule</h2>
                        <div className="flex gap-3 flex-wrap">
                            <div>
                                <select
                                    value={data.employee_id}
                                    onChange={(e) => setData('employee_id', e.target.value)}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.first_name} {emp.last_name}
                                        </option>
                                    ))}
                                </select>
                                {errors.employee_id && <p className="text-xs text-red-600 mt-1">{errors.employee_id}</p>}
                            </div>
                            <div>
                                <select
                                    value={data.work_schedule_id}
                                    onChange={(e) => setData('work_schedule_id', e.target.value)}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Schedule</option>
                                    {workSchedules.map((ws) => (
                                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                                    ))}
                                </select>
                                {errors.work_schedule_id && <p className="text-xs text-red-600 mt-1">{errors.work_schedule_id}</p>}
                            </div>
                            <div>
                                <input
                                    type="date"
                                    value={data.effective_from}
                                    onChange={(e) => setData('effective_from', e.target.value)}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.effective_from && <p className="text-xs text-red-600 mt-1">{errors.effective_from}</p>}
                            </div>
                            <Button type="submit" disabled={processing}>Assign</Button>
                        </div>
                    </form>
                )}

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-200 bg-slate-50">
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Schedule</th>
                                <th className="px-4 py-3">From</th>
                                <th className="px-4 py-3">To</th>
                                <th className="px-4 py-3">Active</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {assignments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No assignments found.</td>
                                </tr>
                            ) : (
                                assignments.data.map((assignment) => (
                                    <tr key={assignment.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {assignment.employee
                                                ? `${assignment.employee.first_name} ${assignment.employee.last_name}`
                                                : `Employee #${assignment.employee_id}`}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {assignment.schedule?.name ?? `Schedule #${assignment.work_schedule_id}`}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{assignment.effective_from}</td>
                                        <td className="px-4 py-3 text-slate-700">{assignment.effective_to ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                assignment.is_current
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {assignment.is_current ? 'Current' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {can('hr.delete') && (
                                                <button
                                                    onClick={() => handleDelete(assignment.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination data={assignments} />
            </div>
        </AppLayout>
    );
}

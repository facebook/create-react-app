import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ShiftAssignment } from '@/types/hr';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    assignments: Paginator<ShiftAssignment>;
    filters: { employee_id?: string; date_from?: string; date_to?: string };
}

const STATUS_COLORS: Record<string, string> = {
    scheduled:  'bg-blue-100 text-blue-700',
    completed:  'bg-green-100 text-green-700',
    absent:     'bg-red-100 text-red-700',
    swapped:    'bg-yellow-100 text-yellow-700',
};

const STATUS_OPTIONS = ['scheduled', 'completed', 'absent', 'swapped'];

export default function ShiftAssignmentsIndex({ assignments, filters }: Props) {
    const { can } = usePermission();

    function applyFilter(key: string, value: string) {
        router.get('/hr/shift-assignments', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    function markStatus(id: number, status: string) {
        router.patch(`/hr/shift-assignments/${id}/status`, { status }, { preserveState: false });
    }

    return (
        <AppLayout>
            <Head title="Shift Assignments" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Shift Assignments</h1>
                        <p className="text-sm text-slate-500 mt-1">{assignments.total} assignment{assignments.total !== 1 ? 's' : ''}</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/shift-assignments/create">
                            <Button>New Assignment</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
                        <input
                            type="text"
                            placeholder="Employee ID"
                            value={filters.employee_id ?? ''}
                            onChange={(e) => applyFilter('employee_id', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none w-32"
                        />
                        <input
                            type="date"
                            value={filters.date_from ?? ''}
                            onChange={(e) => applyFilter('date_from', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        <span className="text-sm text-slate-500">to</span>
                        <input
                            type="date"
                            value={filters.date_to ?? ''}
                            onChange={(e) => applyFilter('date_to', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    {assignments.data.length === 0 ? (
                        <p className="p-6 text-sm text-slate-500">No shift assignments found.</p>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Shift Template</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    {can('hr.create') && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Update Status</th>
                                    )}
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {assignments.data.map((assignment) => (
                                    <tr key={assignment.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm text-slate-900">
                                            {assignment.employee
                                                ? `${assignment.employee.first_name} ${assignment.employee.last_name}`
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {assignment.shift_template?.name ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {assignment.assigned_date as unknown as string}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[assignment.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {assignment.status}
                                            </span>
                                        </td>
                                        {can('hr.create') && (
                                            <td className="px-4 py-3">
                                                <select
                                                    value={assignment.status}
                                                    onChange={(e) => markStatus(assignment.id, e.target.value)}
                                                    className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-right">
                                            {can('hr.delete') && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this assignment?')) {
                                                            router.delete(`/hr/shift-assignments/${assignment.id}`);
                                                        }
                                                    }}
                                                    className="text-xs text-red-600 hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {assignments.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Page {assignments.current_page} of {assignments.last_page}</span>
                        <div className="flex gap-2">
                            {assignments.prev_page_url && (
                                <Link href={assignments.prev_page_url} className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50">Previous</Link>
                            )}
                            {assignments.next_page_url && (
                                <Link href={assignments.next_page_url} className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50">Next</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

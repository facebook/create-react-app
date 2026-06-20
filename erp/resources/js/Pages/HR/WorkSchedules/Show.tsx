import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { WorkSchedule, WorkScheduleShift, EmployeeSchedule } from '@/types/hr';

interface Props extends PageProps {
    workSchedule: WorkSchedule & {
        shifts: WorkScheduleShift[];
        assignments: EmployeeSchedule[];
    };
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ShowWorkSchedule({ workSchedule }: Props) {
    const { can } = usePermission();
    const { data, setData, post, processing, errors, reset } = useForm({
        day_of_week: 'monday',
        start_time: '09:00',
        end_time: '17:00',
        break_minutes: '30',
    });

    function handleAddShift(e: React.FormEvent) {
        e.preventDefault();
        post(`/hr/work-schedules/${workSchedule.id}/shifts`, { onSuccess: () => reset() });
    }

    function deleteSchedule() {
        if (confirm('Delete this work schedule? This cannot be undone.')) {
            router.delete(`/hr/work-schedules/${workSchedule.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Work Schedule — ${workSchedule.name}`} />
            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">{workSchedule.name}</h1>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                workSchedule.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {workSchedule.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            {workSchedule.timezone} · {workSchedule.hours_per_week}h/week
                        </p>
                        {workSchedule.description && (
                            <p className="text-sm text-slate-600 mt-1">{workSchedule.description}</p>
                        )}
                    </div>
                    <a href="/hr/work-schedules" className="text-sm text-slate-600 hover:text-slate-900">
                        ← Back to Schedules
                    </a>
                </div>

                {/* Shifts Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-900">Shifts ({workSchedule.shifts?.length ?? 0})</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-3">Day</th>
                                <th className="px-6 py-3">Start</th>
                                <th className="px-6 py-3">End</th>
                                <th className="px-6 py-3">Break (min)</th>
                                <th className="px-6 py-3">Hours</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(!workSchedule.shifts || workSchedule.shifts.length === 0) ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-slate-500">No shifts added yet.</td>
                                </tr>
                            ) : (
                                workSchedule.shifts.map((shift) => (
                                    <tr key={shift.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-medium text-slate-900 capitalize">{shift.day_of_week}</td>
                                        <td className="px-6 py-3 text-slate-700">{shift.start_time}</td>
                                        <td className="px-6 py-3 text-slate-700">{shift.end_time}</td>
                                        <td className="px-6 py-3 text-slate-700">{shift.break_minutes}</td>
                                        <td className="px-6 py-3 text-slate-700">{shift.hours}h</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add Shift Form */}
                {can('hr.create') && (
                    <form onSubmit={handleAddShift} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900 mb-3">Add Shift</h2>
                        <div className="flex gap-3 flex-wrap">
                            <div>
                                <select
                                    value={data.day_of_week}
                                    onChange={(e) => setData('day_of_week', e.target.value)}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {DAYS.map((day) => (
                                        <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                                    ))}
                                </select>
                                {errors.day_of_week && <p className="text-xs text-red-600 mt-1">{errors.day_of_week}</p>}
                            </div>
                            <div>
                                <input
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.start_time && <p className="text-xs text-red-600 mt-1">{errors.start_time}</p>}
                            </div>
                            <div>
                                <input
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.end_time && <p className="text-xs text-red-600 mt-1">{errors.end_time}</p>}
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Break (min)"
                                    value={data.break_minutes}
                                    onChange={(e) => setData('break_minutes', e.target.value)}
                                    min={0}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-28"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>Add Shift</Button>
                        </div>
                    </form>
                )}

                {/* Assigned Employees */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-900">Assigned Employees ({workSchedule.assignments?.length ?? 0})</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {(!workSchedule.assignments || workSchedule.assignments.length === 0) ? (
                            <p className="px-6 py-4 text-sm text-slate-500">No employees assigned.</p>
                        ) : (
                            workSchedule.assignments.map((assignment) => (
                                <div key={assignment.id} className="px-6 py-3 flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium text-slate-900">
                                            {assignment.employee
                                                ? `${assignment.employee.first_name} ${assignment.employee.last_name}`
                                                : `Employee #${assignment.employee_id}`}
                                        </span>
                                        <span className="text-xs text-slate-500 ml-2">
                                            From {assignment.effective_from}
                                            {assignment.effective_to ? ` to ${assignment.effective_to}` : ''}
                                        </span>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                        assignment.is_current ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {assignment.is_current ? 'Current' : 'Inactive'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Actions */}
                {can('hr.delete') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Actions</h2>
                        <button
                            onClick={deleteSchedule}
                            className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 border border-red-200"
                        >
                            Delete Schedule
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

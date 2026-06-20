import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Employee } from '@/types/hr';

interface Props extends PageProps {
    employees: Pick<Employee, 'id' | 'first_name' | 'last_name'>[];
}

export default function CreateAttendance({ employees }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id:   '',
        work_date:     '',
        clock_in:      '',
        clock_out:     '',
        break_minutes: '0',
        status:        'present',
        notes:         '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/attendance');
    }

    return (
        <AppLayout>
            <Head title="Log Attendance" />
            <div className="max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Log Attendance</h1>
                    <p className="text-sm text-slate-500 mt-1">Record employee attendance for a work day</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Employee *</label>
                            <select
                                value={data.employee_id}
                                onChange={(e) => setData('employee_id', e.target.value)}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            >
                                <option value="">Select employee…</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.first_name} {emp.last_name}
                                    </option>
                                ))}
                            </select>
                            {errors.employee_id && <p className="text-sm text-red-600 mt-1">{errors.employee_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Work Date *</label>
                            <input
                                type="date"
                                value={data.work_date}
                                onChange={(e) => setData('work_date', e.target.value)}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                            {errors.work_date && <p className="text-sm text-red-600 mt-1">{errors.work_date}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Clock In</label>
                                <input
                                    type="time"
                                    value={data.clock_in}
                                    onChange={(e) => setData('clock_in', e.target.value)}
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                />
                                {errors.clock_in && <p className="text-sm text-red-600 mt-1">{errors.clock_in}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Clock Out</label>
                                <input
                                    type="time"
                                    value={data.clock_out}
                                    onChange={(e) => setData('clock_out', e.target.value)}
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                />
                                {errors.clock_out && <p className="text-sm text-red-600 mt-1">{errors.clock_out}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Break Minutes</label>
                            <input
                                type="number"
                                min="0"
                                value={data.break_minutes}
                                onChange={(e) => setData('break_minutes', e.target.value)}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                            {errors.break_minutes && <p className="text-sm text-red-600 mt-1">{errors.break_minutes}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="half_day">Half Day</option>
                                <option value="holiday">Holiday</option>
                                <option value="leave">Leave</option>
                            </select>
                            {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                placeholder="Optional notes…"
                            />
                            {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Log Attendance'}
                        </Button>
                        <a href="/hr/attendance" className="text-sm text-slate-600 hover:text-slate-900">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

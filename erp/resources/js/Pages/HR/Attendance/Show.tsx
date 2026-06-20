import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { AttendanceRecord } from '@/types/hr';

interface Props extends PageProps {
    attendance: AttendanceRecord;
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

export default function ShowAttendance({ attendance }: Props) {
    const { can } = usePermission();

    const employeeName = attendance.employee
        ? `${attendance.employee.first_name} ${attendance.employee.last_name}`
        : '—';

    const { data, setData, patch, processing, errors } = useForm({
        clock_in:      attendance.clock_in?.slice(0, 5) ?? '',
        clock_out:     attendance.clock_out?.slice(0, 5) ?? '',
        break_minutes: String(attendance.break_minutes),
        status:        attendance.status,
        notes:         attendance.notes ?? '',
    });

    function submitUpdate(e: React.FormEvent) {
        e.preventDefault();
        patch(`/hr/attendance/${attendance.id}`);
    }

    function deleteRecord() {
        if (confirm('Delete this attendance record? This cannot be undone.')) {
            router.delete(`/hr/attendance/${attendance.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Attendance — ${employeeName}`} />
            <div className="max-w-3xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">Attendance Record</h1>
                            <StatusBadge status={attendance.status} />
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            {employeeName} · {attendance.work_date}
                        </p>
                    </div>
                    <a href="/hr/attendance" className="text-sm text-slate-600 hover:text-slate-900">
                        ← Back to Attendance
                    </a>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Employee</dt>
                            <dd className="mt-1 text-sm font-medium text-slate-900">{employeeName}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Work Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{attendance.work_date}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Clock In</dt>
                            <dd className="mt-1 text-sm text-slate-900">{attendance.clock_in ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Clock Out</dt>
                            <dd className="mt-1 text-sm text-slate-900">{attendance.clock_out ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Break</dt>
                            <dd className="mt-1 text-sm text-slate-900">{attendance.break_minutes} min</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Worked Hours</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {attendance.worked_hours != null ? `${attendance.worked_hours}h` : '—'}
                            </dd>
                        </div>
                    </dl>
                    {attendance.notes && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Notes</dt>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{attendance.notes}</p>
                        </div>
                    )}
                </div>

                {/* Edit Form */}
                {can('hr.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Update Record</h2>
                        <form onSubmit={submitUpdate} className="space-y-4">
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
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
                                />
                                {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes}</p>}
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                                {can('hr.delete') && (
                                    <button
                                        type="button"
                                        onClick={deleteRecord}
                                        className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 border border-red-200"
                                    >
                                        Delete Record
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

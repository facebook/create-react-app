import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ShiftTemplate, ShiftAssignment } from '@/types/hr';

interface Props extends PageProps {
    shiftTemplate: ShiftTemplate & { assignments: ShiftAssignment[] };
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_COLORS: Record<string, string> = {
    scheduled:  'bg-blue-100 text-blue-700',
    completed:  'bg-green-100 text-green-700',
    absent:     'bg-red-100 text-red-700',
    swapped:    'bg-yellow-100 text-yellow-700',
};

export default function ShiftTemplatesShow({ shiftTemplate }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (confirm(`Delete "${shiftTemplate.name}"? This cannot be undone.`)) {
            router.delete(`/hr/shift-templates/${shiftTemplate.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={shiftTemplate.name} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span
                            className="inline-block h-4 w-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: shiftTemplate.color }}
                        />
                        <h1 className="text-2xl font-semibold text-slate-900">{shiftTemplate.name}</h1>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${shiftTemplate.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {shiftTemplate.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/hr/shift-templates" className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2">
                            Back
                        </Link>
                        {can('hr.delete') && (
                            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                        <h2 className="text-lg font-medium text-slate-900 mb-4">Template Details</h2>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Start Time</dt>
                                <dd className="text-sm font-medium text-slate-900">{shiftTemplate.start_time}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">End Time</dt>
                                <dd className="text-sm font-medium text-slate-900">{shiftTemplate.end_time}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Break</dt>
                                <dd className="text-sm font-medium text-slate-900">{shiftTemplate.break_minutes} min</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Duration</dt>
                                <dd className="text-sm font-medium text-slate-900">{shiftTemplate.duration_hours}h</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Days</dt>
                                <dd className="text-sm font-medium text-slate-900">
                                    {shiftTemplate.days_of_week && shiftTemplate.days_of_week.length > 0
                                        ? shiftTemplate.days_of_week.map((d) => DAY_NAMES[d]).join(', ')
                                        : '—'}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Color</dt>
                                <dd className="flex items-center gap-2">
                                    <span
                                        className="inline-block h-4 w-4 rounded border border-slate-200"
                                        style={{ backgroundColor: shiftTemplate.color }}
                                    />
                                    <span className="text-sm font-medium text-slate-900">{shiftTemplate.color}</span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-slate-900">Upcoming Assignments</h2>
                            {can('hr.create') && (
                                <Link href={`/hr/shift-assignments/create?shift_template_id=${shiftTemplate.id}`}>
                                    <Button>Assign</Button>
                                </Link>
                            )}
                        </div>
                        {shiftTemplate.assignments.length === 0 ? (
                            <p className="text-sm text-slate-500">No upcoming assignments.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {shiftTemplate.assignments.map((assignment) => (
                                    <li key={assignment.id} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {assignment.employee
                                                    ? `${assignment.employee.first_name} ${assignment.employee.last_name}`
                                                    : '—'}
                                            </p>
                                            <p className="text-xs text-slate-500">{assignment.assigned_date as unknown as string}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[assignment.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {assignment.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

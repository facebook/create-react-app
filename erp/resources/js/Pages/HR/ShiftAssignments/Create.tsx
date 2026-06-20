import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { ShiftTemplate, Employee } from '@/types/hr';

interface Props extends PageProps {
    shiftTemplates: ShiftTemplate[];
    employees: Employee[];
}

export default function ShiftAssignmentsCreate({ shiftTemplates, employees }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        shift_template_id: '',
        employee_id: '',
        assigned_date: '',
        notes: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/shift-assignments');
    }

    return (
        <AppLayout>
            <Head title="New Shift Assignment" />
            <div className="max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">New Shift Assignment</h1>
                    <Link href="/hr/shift-assignments" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Shift Template <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.shift_template_id}
                            onChange={(e) => setData('shift_template_id', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">Select a shift template</option>
                            {shiftTemplates.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} ({t.start_time} – {t.end_time})
                                </option>
                            ))}
                        </select>
                        {errors.shift_template_id && <p className="mt-1 text-xs text-red-600">{errors.shift_template_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Employee <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.employee_id}
                            onChange={(e) => setData('employee_id', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">Select an employee</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                        </select>
                        {errors.employee_id && <p className="mt-1 text-xs text-red-600">{errors.employee_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Assigned Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.assigned_date}
                            onChange={(e) => setData('assigned_date', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        {errors.assigned_date && <p className="mt-1 text-xs text-red-600">{errors.assigned_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            placeholder="Optional notes..."
                        />
                        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <Link href="/hr/shift-assignments" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Assignment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

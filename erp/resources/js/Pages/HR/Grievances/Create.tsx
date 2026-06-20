import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    employees: { id: number; first_name: string; last_name: string }[];
}

const CATEGORIES = [
    { value: 'harassment', label: 'Harassment' },
    { value: 'discrimination', label: 'Discrimination' },
    { value: 'working_conditions', label: 'Working Conditions' },
    { value: 'pay', label: 'Pay' },
    { value: 'management', label: 'Management' },
    { value: 'other', label: 'Other' },
];

export default function GrievancesCreate({ employees }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id:    '' as string | number,
        category:       'other',
        submitted_date: '',
        description:    '',
        is_anonymous:   false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/grievances');
    }

    return (
        <AppLayout>
            <Head title="New Grievance" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Grievance</h1>
                    <p className="text-sm text-slate-500 mt-1">Submit a new grievance.</p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                        <select
                            value={data.employee_id}
                            onChange={(e) => setData('employee_id', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">Select employee…</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                            ))}
                        </select>
                        {errors.employee_id && <p className="mt-1 text-xs text-red-600">{errors.employee_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                            {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Submitted Date</label>
                            <input
                                type="date"
                                value={data.submitted_date}
                                onChange={(e) => setData('submitted_date', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.submitted_date && <p className="mt-1 text-xs text-red-600">{errors.submitted_date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Describe the grievance…"
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="is_anonymous"
                            type="checkbox"
                            checked={data.is_anonymous}
                            onChange={(e) => setData('is_anonymous', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_anonymous" className="text-sm text-slate-700">Submit anonymously</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href="/hr/grievances">
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Submitting…' : 'Submit Grievance'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

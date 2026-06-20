import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    employees: { id: number; first_name: string; last_name: string }[];
}

const INCIDENT_TYPES = [
    { value: 'misconduct', label: 'Misconduct' },
    { value: 'poor_performance', label: 'Poor Performance' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'policy_violation', label: 'Policy Violation' },
    { value: 'other', label: 'Other' },
];

const SEVERITIES = [
    { value: 'minor', label: 'Minor' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'major', label: 'Major' },
    { value: 'gross', label: 'Gross' },
];

export default function DisciplinaryCasesCreate({ employees }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id:   '' as string | number,
        incident_type: 'misconduct',
        incident_date: '',
        severity:      'minor',
        description:   '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/disciplinary-cases');
    }

    return (
        <AppLayout>
            <Head title="New Disciplinary Case" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Disciplinary Case</h1>
                    <p className="text-sm text-slate-500 mt-1">Record a new disciplinary case.</p>
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">Incident Type</label>
                            <select
                                value={data.incident_type}
                                onChange={(e) => setData('incident_type', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                {INCIDENT_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            {errors.incident_type && <p className="mt-1 text-xs text-red-600">{errors.incident_type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                            <select
                                value={data.severity}
                                onChange={(e) => setData('severity', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                {SEVERITIES.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            {errors.severity && <p className="mt-1 text-xs text-red-600">{errors.severity}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Incident Date</label>
                        <input
                            type="date"
                            value={data.incident_date}
                            onChange={(e) => setData('incident_date', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.incident_date && <p className="mt-1 text-xs text-red-600">{errors.incident_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Describe the incident…"
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href="/hr/disciplinary-cases">
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating…' : 'Create Case'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

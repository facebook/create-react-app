import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Employee } from '@/types/hr';

interface OnboardingTemplate {
    id: number;
    name: string;
    description: string | null;
}

interface Props extends PageProps {
    employee: Employee;
    templates: OnboardingTemplate[];
}

export default function EmployeeOnboardingCreate({ employee, templates }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        template_id: '',
        title: '',
        started_at: new Date().toISOString().split('T')[0],
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/hr/employees/${employee.id}/onboardings`);
    }

    const inputClass =
        'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

    const selectedTemplate = templates.find((t) => t.id === Number(data.template_id));

    return (
        <AppLayout>
            <Head title={`New Onboarding — ${employee.first_name} ${employee.last_name}`} />
            <div className="mx-auto max-w-lg space-y-6">
                <div>
                    <p className="text-sm text-slate-500">
                        <Link href="/hr/employees" className="text-indigo-600 hover:underline">
                            Employees
                        </Link>{' '}
                        &rsaquo;{' '}
                        <Link
                            href={`/hr/employees/${employee.id}`}
                            className="text-indigo-600 hover:underline"
                        >
                            {employee.first_name} {employee.last_name}
                        </Link>{' '}
                        &rsaquo;{' '}
                        <Link
                            href={`/hr/employees/${employee.id}/onboardings`}
                            className="text-indigo-600 hover:underline"
                        >
                            Onboardings
                        </Link>{' '}
                        &rsaquo; New
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-900">New Onboarding</h1>
                    <p className="text-sm text-slate-500">
                        For {employee.first_name} {employee.last_name}
                    </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Template</label>
                            <select
                                value={data.template_id}
                                onChange={(e) => setData('template_id', e.target.value)}
                                className={inputClass}
                            >
                                <option value="">— No template (blank) —</option>
                                {templates.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                            {errors.template_id && (
                                <p className="mt-1 text-xs text-red-600">{errors.template_id}</p>
                            )}
                            {selectedTemplate?.description && (
                                <p className="mt-1.5 text-xs text-slate-500">{selectedTemplate.description}</p>
                            )}
                        </div>

                        {!data.template_id && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Standard Onboarding"
                                    className={inputClass}
                                />
                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.started_at}
                                onChange={(e) => setData('started_at', e.target.value)}
                                className={inputClass}
                                required
                            />
                            {errors.started_at && (
                                <p className="mt-1 text-xs text-red-600">{errors.started_at}</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Start Onboarding'}
                            </Button>
                            <Link href={`/hr/employees/${employee.id}/onboardings`}>
                                <Button variant="secondary" type="button">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

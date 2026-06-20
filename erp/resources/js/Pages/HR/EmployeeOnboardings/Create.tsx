import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Employee, OnboardingChecklist } from '@/types/hr';

interface Props extends PageProps {
    employees: Pick<Employee, 'id' | 'first_name' | 'last_name'>[];
    checklists: Pick<OnboardingChecklist, 'id' | 'name'>[];
}

interface FormData {
    employee_id: string;
    onboarding_checklist_id: string;
    start_date: string;
}

export default function EmployeeOnboardingsCreate({ employees, checklists }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        employee_id: '',
        onboarding_checklist_id: '',
        start_date: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/employee-onboardings');
    }

    return (
        <AppLayout>
            <Head title="Assign Onboarding" />
            <div className="max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Assign Onboarding Checklist</h1>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Employee *</label>
                        <select
                            value={data.employee_id}
                            onChange={(e) => setData('employee_id', e.target.value)}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        >
                            <option value="">Select employee...</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                        </select>
                        {errors.employee_id && <p className="mt-1 text-sm text-red-600">{errors.employee_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Onboarding Checklist *</label>
                        <select
                            value={data.onboarding_checklist_id}
                            onChange={(e) => setData('onboarding_checklist_id', e.target.value)}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        >
                            <option value="">Select checklist...</option>
                            {checklists.map((cl) => (
                                <option key={cl.id} value={cl.id}>
                                    {cl.name}
                                </option>
                            ))}
                        </select>
                        {errors.onboarding_checklist_id && <p className="mt-1 text-sm text-red-600">{errors.onboarding_checklist_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
                        <input
                            type="date"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                        {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href="/hr/employee-onboardings">
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Assign Onboarding'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

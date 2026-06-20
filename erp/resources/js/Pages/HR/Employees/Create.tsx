import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Department, EmploymentType, SalaryType } from '@/types/hr';

interface Props extends PageProps {
    departments: Pick<Department, 'id' | 'name'>[];
    users: { id: number; name: string; email: string }[];
}

export default function EmployeeCreate({ departments, users }: Props) {
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        employee_number: '', position: '',
        department_id: '' as number | '',
        user_id: '' as number | '',
        employment_type: 'full_time' as EmploymentType,
        status: 'active' as const,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        salary_type: 'monthly' as SalaryType,
        salary_amount: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/hr/employees', {
            ...form,
            department_id: form.department_id || null,
            user_id: form.user_id || null,
            end_date: form.end_date || null,
        } as any, {
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    }

    const f = (field: keyof typeof form) => ({
        value: form[field] as string,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value })),
    });

    return (
        <AppLayout>
            <Head title="New Employee" />
            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Employee</h1>
                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name <span className="text-red-500">*</span></label>
                            <input {...f('first_name')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                            <input {...f('last_name')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" {...f('email')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input {...f('phone')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Employee Number</label>
                            <input {...f('employee_number')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none" />
                            {errors.employee_number && <p className="mt-1 text-xs text-red-500">{errors.employee_number}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                            <input {...f('position')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                            <select value={form.department_id}
                                onChange={(e) => setForm({ ...form, department_id: e.target.value ? Number(e.target.value) : '' })}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="">No department</option>
                                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Linked User Account</label>
                            <select value={form.user_id}
                                onChange={(e) => setForm({ ...form, user_id: e.target.value ? Number(e.target.value) : '' })}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="">None</option>
                                {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type <span className="text-red-500">*</span></label>
                            <select {...f('employment_type')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="full_time">Full-time</option>
                                <option value="part_time">Part-time</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status <span className="text-red-500">*</span></label>
                            <select {...f('status')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="active">Active</option>
                                <option value="on_leave">On Leave</option>
                                <option value="terminated">Terminated</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                            <input type="date" {...f('start_date')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                            <input type="date" {...f('end_date')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Salary Type <span className="text-red-500">*</span></label>
                            <select {...f('salary_type')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="monthly">Monthly</option>
                                <option value="hourly">Hourly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Salary Amount <span className="text-red-500">*</span></label>
                            <input type="number" min="0" step="0.01" {...f('salary_amount')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            {errors.salary_amount && <p className="mt-1 text-xs text-red-500">{errors.salary_amount}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => history.back()}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Create Employee</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

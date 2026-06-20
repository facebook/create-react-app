import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    roles: string[];
}

export default function UserCreate({ roles }: Props) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        router.post('/admin/users', form, {
            onError: (errs) => setErrors(errs as Record<string, string>),
        });
    }

    return (
        <AppLayout>
            <Head title="New User" />
            <div className="max-w-lg space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New User</h1>
                    <p className="text-sm text-slate-500 mt-1">Create a new user account.</p>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">Select role…</option>
                            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => router.visit('/admin/users')}>Cancel</Button>
                        <Button type="submit">Create User</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

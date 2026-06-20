import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User { id: number; name: string; }

interface Props extends PageProps {
    users: User[];
}

export default function ProjectCreate({ users }: Props) {
    const [form, setForm] = useState({
        name: '',
        code: '',
        description: '',
        status: 'draft',
        priority: 'medium',
        budget: '',
        start_date: '',
        end_date: '',
        client_name: '',
        manager_id: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post('/pm/projects', form, {
            onError: (errs) => setErrors(errs),
        });
    }

    const inputClass = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

    return (
        <AppLayout>
            <Head title="New Project" />
            <div className="max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Project</h1>
                <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Name *</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className={inputClass} required />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Code</label>
                            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                                placeholder="Auto-generated if blank" className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Client Name</label>
                            <input type="text" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                                className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Status</label>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Priority</label>
                            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Manager</label>
                            <select value={form.manager_id} onChange={(e) => setForm({ ...form, manager_id: e.target.value })} className={inputClass}>
                                <option value="">None</option>
                                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Budget</label>
                            <input type="number" step="0.01" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                                className={inputClass} />
                            {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Start Date</label>
                            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">End Date</label>
                            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                className={inputClass} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={4} className={inputClass} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit">Create Project</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

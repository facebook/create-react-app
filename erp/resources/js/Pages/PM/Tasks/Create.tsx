import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User { id: number; name: string; }
interface Project { id: number; name: string; }

interface Props extends PageProps {
    project: Project;
    users: User[];
}

export default function TaskCreate({ project, users }: Props) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee_id: '',
        due_date: '',
        estimated_hours: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post(`/pm/projects/${project.id}/tasks`, form, {
            onError: (errs) => setErrors(errs),
        });
    }

    const inputClass = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

    return (
        <AppLayout>
            <Head title="New Task" />
            <div className="max-w-2xl space-y-6">
                <div>
                    <p className="text-sm text-slate-500">
                        Project: <a href={`/pm/projects/${project.id}`} className="text-indigo-600 hover:underline">{project.name}</a>
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">New Task</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Title *</label>
                            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className={inputClass} required />
                            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Status</label>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Priority</label>
                            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Assignee</label>
                            <select value={form.assignee_id} onChange={(e) => setForm({ ...form, assignee_id: e.target.value })} className={inputClass}>
                                <option value="">Unassigned</option>
                                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Due Date</label>
                            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Estimated Hours</label>
                            <input type="number" step="0.5" min="0" value={form.estimated_hours}
                                onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })} className={inputClass} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={4} className={inputClass} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit">Create Task</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

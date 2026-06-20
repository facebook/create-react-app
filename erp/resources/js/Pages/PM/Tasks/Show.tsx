import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User { id: number; name: string; }

interface TimeEntry {
    id: number;
    hours: number;
    date: string;
    description: string | null;
    is_billable: boolean;
    user: User;
}

interface Task {
    id: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assignee: User | null;
    due_date: string | null;
    estimated_hours: number | null;
    actual_hours: number;
    time_entries: TimeEntry[];
}

interface Project { id: number; name: string; }

interface Props extends PageProps {
    project: Project;
    task: Task;
    users: User[];
}

const statusBadge: Record<string, string> = {
    todo:        'bg-slate-100 text-slate-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    review:      'bg-purple-100 text-purple-800',
    done:        'bg-green-100 text-green-800',
    cancelled:   'bg-red-100 text-red-800',
};

const priorityBadge: Record<string, string> = {
    low:    'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

export default function TaskShow({ project, task, users }: Props) {
    const [logForm, setLogForm] = useState({
        hours: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        is_billable: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleComplete() {
        router.post(`/pm/projects/${project.id}/tasks/${task.id}/complete`);
    }

    function handleLogTime(e: React.FormEvent) {
        e.preventDefault();
        router.post(`/pm/tasks/${task.id}/time-entries`, logForm, {
            onSuccess: () => setLogForm({ hours: '', description: '', date: new Date().toISOString().split('T')[0], is_billable: true }),
            onError: (errs) => setErrors(errs),
        });
    }

    function deleteTimeEntry(id: number) {
        if (confirm('Delete this time entry?')) {
            router.delete(`/pm/time-entries/${id}`);
        }
    }

    const inputClass = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

    return (
        <AppLayout>
            <Head title={task.title} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-slate-500">
                            <Link href={`/pm/projects/${project.id}`} className="text-indigo-600 hover:underline">{project.name}</Link>
                            {' '}&rsaquo; Task
                        </p>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">{task.title}</h1>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge[task.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                {task.status.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityBadge[task.priority] ?? 'bg-slate-100 text-slate-800'}`}>
                                {task.priority}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {task.status !== 'done' && task.status !== 'cancelled' && (
                            <Button onClick={handleComplete} variant="secondary">Mark as Done</Button>
                        )}
                        <Link href={`/pm/projects/${project.id}/tasks/${task.id}/edit`}>
                            <Button variant="secondary">Edit</Button>
                        </Link>
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-4">
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Assignee</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{task.assignee?.name ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Due Date</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{task.due_date ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Estimated Hours</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{task.estimated_hours ? `${task.estimated_hours}h` : '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Actual Hours</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{task.actual_hours}h</p>
                    </div>
                    {task.description && (
                        <div className="col-span-4">
                            <p className="text-xs font-medium uppercase text-slate-500">Description</p>
                            <p className="mt-1 text-sm text-slate-700">{task.description}</p>
                        </div>
                    )}
                </div>

                {/* Log Time Form */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-800">Log Time</h2>
                    <form onSubmit={handleLogTime} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Hours *</label>
                            <input type="number" step="0.25" min="0.01" value={logForm.hours}
                                onChange={(e) => setLogForm({ ...logForm, hours: e.target.value })}
                                className={inputClass} required />
                            {errors.hours && <p className="mt-1 text-xs text-red-600">{errors.hours}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Date *</label>
                            <input type="date" value={logForm.date}
                                onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                                className={inputClass} required />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <input type="text" value={logForm.description}
                                onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                                className={inputClass} />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input type="checkbox" id="billable" checked={logForm.is_billable}
                                onChange={(e) => setLogForm({ ...logForm, is_billable: e.target.checked })}
                                className="h-4 w-4 rounded border-slate-300" />
                            <label htmlFor="billable" className="text-sm text-slate-700">Billable</label>
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" size="sm">Log Time</Button>
                        </div>
                    </form>
                </div>

                {/* Time Entries */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Time Entries</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Hours</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Billable</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {task.time_entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-900">{entry.user.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{entry.hours}h</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{entry.date}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${entry.is_billable ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {entry.is_billable ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{entry.description ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <button onClick={() => deleteTimeEntry(entry.id)}
                                            className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600 hover:bg-red-100">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {task.time_entries.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">No time entries yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

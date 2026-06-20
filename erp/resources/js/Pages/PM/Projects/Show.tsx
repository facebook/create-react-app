import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User { id: number; name: string; }

interface Task {
    id: number;
    title: string;
    status: string;
    priority: string;
    assignee: User | null;
    due_date: string | null;
}

interface Milestone {
    id: number;
    name: string;
    due_date: string | null;
    is_completed: boolean;
    completed_at: string | null;
}

interface TimeEntry {
    id: number;
    hours: number;
    date: string;
    description: string | null;
    user: User;
}

interface Project {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    status: string;
    priority: string;
    budget: number | null;
    spent_budget: number;
    start_date: string | null;
    end_date: string | null;
    client_name: string | null;
    manager: User | null;
    tasks: Task[];
    milestones: Milestone[];
    members: User[];
    time_entries: TimeEntry[];
}

interface Props extends PageProps {
    project: Project;
}

const statusBadge: Record<string, string> = {
    draft:       'bg-slate-100 text-slate-800',
    active:      'bg-green-100 text-green-800',
    on_hold:     'bg-yellow-100 text-yellow-800',
    completed:   'bg-blue-100 text-blue-800',
    cancelled:   'bg-red-100 text-red-800',
    todo:        'bg-slate-100 text-slate-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    review:      'bg-purple-100 text-purple-800',
    done:        'bg-green-100 text-green-800',
};

export default function ProjectShow({ project }: Props) {
    const [activeTab, setActiveTab] = useState<'tasks' | 'milestones' | 'members' | 'timelog'>('tasks');
    const [milestoneForm, setMilestoneForm] = useState({ name: '', due_date: '' });

    function handleMilestoneSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post(`/pm/projects/${project.id}/milestones`, milestoneForm, {
            onSuccess: () => setMilestoneForm({ name: '', due_date: '' }),
        });
    }

    function completeMilestone(milestoneId: number) {
        router.post(`/pm/projects/${project.id}/milestones/${milestoneId}/complete`);
    }

    function deleteMilestone(milestoneId: number) {
        if (confirm('Delete this milestone?')) {
            router.delete(`/pm/projects/${project.id}/milestones/${milestoneId}`);
        }
    }

    function completeTask(taskId: number) {
        router.post(`/pm/projects/${project.id}/tasks/${taskId}/complete`);
    }

    const totalHours = project.time_entries.reduce((sum, e) => sum + e.hours, 0);

    return (
        <AppLayout>
            <Head title={project.name} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
                            {project.code && (
                                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                                    {project.code}
                                </span>
                            )}
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge[project.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                {project.status.replace('_', ' ')}
                            </span>
                        </div>
                        {project.description && (
                            <p className="text-sm text-slate-600">{project.description}</p>
                        )}
                    </div>
                    <Link href={`/pm/projects/${project.id}/edit`}>
                        <Button variant="secondary">Edit</Button>
                    </Link>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-4">
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Manager</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{project.manager?.name ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Client</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{project.client_name ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Budget / Spent</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                            {project.budget ? `$${project.budget.toLocaleString()}` : '—'} / ${project.spent_budget.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Dates</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                            {project.start_date ?? '—'} → {project.end_date ?? '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Total Hours Logged</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{totalHours}h</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Members</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{project.members.length}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div>
                    <div className="flex gap-1 border-b border-slate-200">
                        {(['tasks', 'milestones', 'members', 'timelog'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={[
                                    'px-4 py-2 text-sm font-medium capitalize transition-colors',
                                    activeTab === tab
                                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                                        : 'text-slate-600 hover:text-slate-900',
                                ].join(' ')}
                            >
                                {tab === 'timelog' ? 'Time Log' : tab}
                                {tab === 'tasks' && ` (${project.tasks.length})`}
                                {tab === 'milestones' && ` (${project.milestones.length})`}
                                {tab === 'members' && ` (${project.members.length})`}
                            </button>
                        ))}
                    </div>

                    {/* Tasks Tab */}
                    {activeTab === 'tasks' && (
                        <div className="mt-4 space-y-4">
                            <div className="flex justify-end">
                                <Link href={`/pm/projects/${project.id}/tasks/create`}>
                                    <Button size="sm">Add Task</Button>
                                </Link>
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Title</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Assignee</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Due Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {project.tasks.map((task) => (
                                            <tr key={task.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-sm">
                                                    <Link href={`/pm/projects/${project.id}/tasks/${task.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                                        {task.title}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[task.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{task.assignee?.name ?? '—'}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{task.due_date ?? '—'}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    {task.status !== 'done' && task.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => completeTask(task.id)}
                                                            className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 hover:bg-green-200"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {project.tasks.length === 0 && (
                                            <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No tasks yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Milestones Tab */}
                    {activeTab === 'milestones' && (
                        <div className="mt-4 space-y-4">
                            <form onSubmit={handleMilestoneSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Milestone name *"
                                    value={milestoneForm.name}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                                    className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                                    required
                                />
                                <input
                                    type="date"
                                    value={milestoneForm.due_date}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                                />
                                <Button type="submit" size="sm">Add</Button>
                            </form>
                            <div className="space-y-2">
                                {project.milestones.map((milestone) => (
                                    <div key={milestone.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <span className={`h-3 w-3 rounded-full ${milestone.is_completed ? 'bg-green-500' : 'bg-slate-300'}`} />
                                            <div>
                                                <p className={`text-sm font-medium ${milestone.is_completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                    {milestone.name}
                                                </p>
                                                {milestone.due_date && (
                                                    <p className="text-xs text-slate-500">Due: {milestone.due_date}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!milestone.is_completed && (
                                                <button onClick={() => completeMilestone(milestone.id)}
                                                    className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 hover:bg-green-200">
                                                    Complete
                                                </button>
                                            )}
                                            <button onClick={() => deleteMilestone(milestone.id)}
                                                className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600 hover:bg-red-100">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {project.milestones.length === 0 && (
                                    <p className="py-4 text-center text-sm text-slate-500">No milestones yet.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <div className="mt-4">
                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {project.members.map((member) => (
                                            <tr key={member.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-sm text-slate-900">{member.name}</td>
                                            </tr>
                                        ))}
                                        {project.members.length === 0 && (
                                            <tr><td colSpan={1} className="px-4 py-8 text-center text-sm text-slate-500">No members yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Time Log Tab */}
                    {activeTab === 'timelog' && (
                        <div className="mt-4">
                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">User</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Hours</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {project.time_entries.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-sm text-slate-900">{entry.user.name}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{entry.hours}h</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{entry.date}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{entry.description ?? '—'}</td>
                                            </tr>
                                        ))}
                                        {project.time_entries.length === 0 && (
                                            <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No time entries yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

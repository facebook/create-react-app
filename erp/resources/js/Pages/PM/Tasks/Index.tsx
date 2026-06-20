import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
}

interface Task {
    id: number;
    title: string;
    status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignee: User | null;
    due_date: string | null;
    estimated_hours: number | null;
}

interface Project {
    id: number;
    name: string;
}

interface Props extends PageProps {
    project: Project;
    tasks: Task[];
}

const STATUS_TABS = [
    { key: 'all', label: 'All' },
    { key: 'todo', label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'review', label: 'Review' },
    { key: 'done', label: 'Done' },
    { key: 'cancelled', label: 'Cancelled' },
] as const;

const STATUS_BADGES: Record<string, string> = {
    todo:        'bg-slate-100 text-slate-700',
    in_progress: 'bg-yellow-100 text-yellow-800',
    review:      'bg-purple-100 text-purple-800',
    done:        'bg-green-100 text-green-800',
    cancelled:   'bg-red-100 text-red-700',
};

const PRIORITY_BADGES: Record<string, string> = {
    low:    'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

export default function TasksIndex({ project, tasks }: Props) {
    const [activeTab, setActiveTab] = useState<string>('all');

    const filtered =
        activeTab === 'all' ? tasks : tasks.filter((t) => t.status === activeTab);

    const today = new Date().toISOString().split('T')[0];

    function handleComplete(task: Task) {
        if (confirm(`Mark "${task.title}" as done?`)) {
            router.post(`/pm/projects/${project.id}/tasks/${task.id}/complete`);
        }
    }

    function handleDelete(task: Task) {
        if (confirm(`Delete task "${task.title}"?`)) {
            router.delete(`/pm/projects/${project.id}/tasks/${task.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Tasks — ${project.name}`} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">
                            <Link href="/pm/projects" className="text-indigo-600 hover:underline">
                                Projects
                            </Link>{' '}
                            &rsaquo;{' '}
                            <Link href={`/pm/projects/${project.id}`} className="text-indigo-600 hover:underline">
                                {project.name}
                            </Link>{' '}
                            &rsaquo; Tasks
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Tasks</h1>
                        <p className="text-sm text-slate-500">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/pm/projects/${project.id}/tasks/kanban`}>
                            <Button variant="secondary">Kanban</Button>
                        </Link>
                        <Link href={`/pm/projects/${project.id}/tasks/create`}>
                            <Button>+ New Task</Button>
                        </Link>
                    </div>
                </div>

                {/* Status tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    {STATUS_TABS.map((tab) => {
                        const count =
                            tab.key === 'all'
                                ? tasks.length
                                : tasks.filter((t) => t.status === tab.key).length;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 text-sm font-medium ${
                                    activeTab === tab.key
                                        ? 'border-b-2 border-indigo-600 text-indigo-700'
                                        : 'text-slate-600 hover:text-slate-800'
                                }`}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Task table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                    Task
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                    Priority
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                    Assignee
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                    Due Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                    Est. Hours
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No tasks {activeTab !== 'all' ? `with status "${activeTab}"` : ''}.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((task) => {
                                    const isOverdue =
                                        task.due_date &&
                                        task.due_date < today &&
                                        task.status !== 'done' &&
                                        task.status !== 'cancelled';
                                    return (
                                        <tr key={task.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/pm/projects/${project.id}/tasks/${task.id}`}
                                                    className="font-medium text-indigo-600 hover:text-indigo-800"
                                                >
                                                    {task.title}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[task.status] ?? 'bg-slate-100 text-slate-700'}`}
                                                >
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGES[task.priority] ?? 'bg-slate-100 text-slate-700'}`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {task.assignee?.name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {task.due_date ? (
                                                    <span className={isOverdue ? 'font-medium text-red-600' : 'text-slate-600'}>
                                                        {task.due_date}
                                                        {isOverdue && ' (overdue)'}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {task.estimated_hours ? `${task.estimated_hours}h` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/pm/projects/${project.id}/tasks/${task.id}/edit`}
                                                        className="text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        Edit
                                                    </Link>
                                                    {task.status !== 'done' && task.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => handleComplete(task)}
                                                            className="text-green-600 hover:text-green-800"
                                                        >
                                                            Done
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(task)}
                                                        className="text-red-400 hover:text-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

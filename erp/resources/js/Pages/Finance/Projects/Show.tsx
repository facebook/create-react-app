import { Head, Link, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Project, ProjectTask, ProjectTimeEntry } from '@/types/finance';

interface Props extends PageProps {
    project: Project;
}

const statusColors: Record<string, string> = {
    planning:  'bg-slate-100 text-slate-600',
    active:    'bg-green-50 text-green-700',
    on_hold:   'bg-yellow-50 text-yellow-700',
    completed: 'bg-blue-50 text-blue-700',
    cancelled: 'bg-red-50 text-red-700',
};

const priorityColors: Record<string, string> = {
    low:    'bg-slate-100 text-slate-600',
    medium: 'bg-yellow-50 text-yellow-700',
    high:   'bg-red-50 text-red-700',
};

const taskStatusColors: Record<string, string> = {
    todo:        'bg-slate-100 text-slate-600',
    in_progress: 'bg-blue-50 text-blue-700',
    done:        'bg-green-50 text-green-700',
    cancelled:   'bg-red-50 text-red-700',
};

export default function ProjectShow({ project }: Props) {
    const taskForm = useForm({
        title:           '',
        priority:        'medium' as 'low' | 'medium' | 'high',
        due_date:        '',
        estimated_hours: '',
        description:     '',
        assigned_to:     '',
    });

    const timeForm = useForm({
        hours:       '',
        entry_date:  new Date().toISOString().split('T')[0],
        description: '',
        task_id:     '',
        is_billable: true,
    });

    function submitTask(e: React.FormEvent) {
        e.preventDefault();
        taskForm.post(`/finance/projects/${project.id}/tasks`, {
            onSuccess: () => taskForm.reset(),
        });
    }

    function submitTimeEntry(e: React.FormEvent) {
        e.preventDefault();
        timeForm.post(`/finance/projects/${project.id}/time-entries`, {
            onSuccess: () => timeForm.reset(),
        });
    }

    function updateTaskStatus(taskId: number, status: string) {
        router.patch(`/finance/projects/${project.id}/tasks/${taskId}`, { status });
    }

    function deleteTask(taskId: number) {
        if (confirm('Delete this task?')) {
            router.delete(`/finance/projects/${project.id}/tasks/${taskId}`);
        }
    }

    return (
        <AppLayout>
            <Head title={project.name} />
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href="/finance/projects" className="text-sm text-slate-500 hover:text-slate-700">Projects</Link>
                            <span className="text-slate-300">/</span>
                            <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                {project.status.replace('_', ' ')}
                            </span>
                            {project.contact && (
                                <span className="text-sm text-slate-500">{project.contact.name}</span>
                            )}
                            <span className="text-sm text-slate-500 capitalize">{project.billing_type.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {(project.status === 'planning' || project.status === 'on_hold') && (
                            <Button
                                variant="secondary"
                                onClick={() => router.post(`/finance/projects/${project.id}/activate`)}
                            >
                                Activate
                            </Button>
                        )}
                        {project.status === 'active' && (
                            <Button
                                variant="secondary"
                                onClick={() => router.post(`/finance/projects/${project.id}/complete`)}
                            >
                                Complete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-slate-500">Budget</div>
                        <div className="text-xl font-semibold text-slate-900">
                            {project.budget != null ? Number(project.budget).toFixed(2) : '—'}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-slate-500">Total Hours</div>
                        <div className="text-xl font-semibold text-slate-900">{Number(project.total_hours).toFixed(1)}</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-slate-500">Total Billed</div>
                        <div className="text-xl font-semibold text-slate-900">{Number(project.total_billed).toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-slate-500">Completion</div>
                        <div className="text-xl font-semibold text-slate-900">{Number(project.completion_percent).toFixed(1)}%</div>
                    </div>
                </div>

                {project.description && (
                    <p className="text-sm text-slate-600">{project.description}</p>
                )}

                {/* Tasks Section */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-900">Tasks</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Est. Hrs</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actual Hrs</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Update Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(project.tasks ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-400">No tasks yet.</td>
                                </tr>
                            )}
                            {(project.tasks ?? []).map((task: ProjectTask) => (
                                <tr key={task.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        {task.title}
                                        {task.is_overdue && (
                                            <span className="ml-2 text-xs text-red-500">Overdue</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[task.priority] ?? ''}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${taskStatusColors[task.status] ?? ''}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{task.due_date ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                                        {task.estimated_hours != null ? Number(task.estimated_hours).toFixed(1) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                                        {task.actual_hours != null ? Number(task.actual_hours).toFixed(1) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <select
                                            defaultValue={task.status}
                                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                            className="rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none"
                                        >
                                            <option value="todo">Todo</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="done">Done</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Add Task Form */}
                    <div className="border-t border-slate-200 p-4">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">Add Task</h3>
                        <form onSubmit={submitTask} className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <input
                                        placeholder="Task title *"
                                        value={taskForm.data.title}
                                        onChange={(e) => taskForm.setData('title', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                    />
                                    {taskForm.errors.title && <p className="mt-1 text-xs text-red-500">{taskForm.errors.title}</p>}
                                </div>
                                <div>
                                    <select
                                        value={taskForm.data.priority}
                                        onChange={(e) => taskForm.setData('priority', e.target.value as typeof taskForm.data.priority)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <input
                                        type="date"
                                        placeholder="Due date"
                                        value={taskForm.data.due_date}
                                        onChange={(e) => taskForm.setData('due_date', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.5}
                                        placeholder="Est. hours"
                                        value={taskForm.data.estimated_hours}
                                        onChange={(e) => taskForm.setData('estimated_hours', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" disabled={taskForm.processing}>Add Task</Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Time Entries Section */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-900">Time Entries</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Task</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Hours</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Billable</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(project.time_entries ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">No time entries yet.</td>
                                </tr>
                            )}
                            {(project.time_entries ?? []).map((entry: ProjectTimeEntry) => (
                                <tr key={entry.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-600">{entry.entry_date}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{entry.user?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{entry.task?.title ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700 font-medium">{Number(entry.hours).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-center">
                                        {entry.is_billable ? (
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">Yes</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500">No</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{entry.description ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Add Time Entry Form */}
                    <div className="border-t border-slate-200 p-4">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">Log Time</h3>
                        <form onSubmit={submitTimeEntry} className="space-y-3">
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <input
                                        type="number"
                                        min={0.01}
                                        step={0.25}
                                        placeholder="Hours *"
                                        value={timeForm.data.hours}
                                        onChange={(e) => timeForm.setData('hours', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    />
                                    {timeForm.errors.hours && <p className="mt-1 text-xs text-red-500">{timeForm.errors.hours}</p>}
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        value={timeForm.data.entry_date}
                                        onChange={(e) => timeForm.setData('entry_date', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={timeForm.data.task_id}
                                        onChange={(e) => timeForm.setData('task_id', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    >
                                        <option value="">No Task</option>
                                        {(project.tasks ?? []).map((task: ProjectTask) => (
                                            <option key={task.id} value={task.id}>{task.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={timeForm.data.is_billable}
                                            onChange={(e) => timeForm.setData('is_billable', e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600"
                                        />
                                        <span className="text-slate-700">Billable</span>
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <div className="col-span-3">
                                    <input
                                        placeholder="Description"
                                        value={timeForm.data.description}
                                        onChange={(e) => timeForm.setData('description', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <Button type="submit" disabled={timeForm.processing}>Log Time</Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface TaskRow {
    title: string;
    description: string;
    due_days: number;
    sort_order: number;
}

interface FormData {
    name: string;
    description: string;
    is_active: boolean;
    tasks: TaskRow[];
}

export default function OnboardingTemplatesCreate(_props: PageProps) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        description: '',
        is_active: true,
        tasks: [],
    });

    function addTask() {
        setData('tasks', [
            ...data.tasks,
            { title: '', description: '', due_days: 0, sort_order: data.tasks.length },
        ]);
    }

    function removeTask(index: number) {
        setData('tasks', data.tasks.filter((_, i) => i !== index));
    }

    function updateTask(index: number, field: keyof TaskRow, value: string | number) {
        const updated = [...data.tasks];
        updated[index] = { ...updated[index], [field]: value };
        setData('tasks', updated);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/onboarding-templates');
    }

    return (
        <AppLayout>
            <Head title="New Onboarding Template" />
            <div className="max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Onboarding Template</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-medium text-slate-900">Template Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600"
                            />
                            <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-medium text-slate-900">Tasks</h2>
                            <Button type="button" variant="secondary" onClick={addTask}>Add Task</Button>
                        </div>

                        {data.tasks.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No tasks yet. Click "Add Task" to add one.</p>
                        ) : (
                            <div className="space-y-3">
                                {data.tasks.map((task, index) => (
                                    <div key={index} className="rounded-md border border-slate-200 p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Task Title *</label>
                                                    <input
                                                        type="text"
                                                        value={task.title}
                                                        onChange={(e) => updateTask(index, 'title', e.target.value)}
                                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        placeholder="e.g. Set up workstation"
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Due Days After Start</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={255}
                                                            value={task.due_days}
                                                            onChange={(e) => updateTask(index, 'due_days', parseInt(e.target.value) || 0)}
                                                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Sort Order</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={255}
                                                            value={task.sort_order}
                                                            onChange={(e) => updateTask(index, 'sort_order', parseInt(e.target.value) || 0)}
                                                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeTask(index)}
                                                className="text-red-500 hover:text-red-700 mt-1"
                                            >
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href="/hr/onboarding-templates">
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Create Template'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

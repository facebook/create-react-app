import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Task { id: number; title: string; project: { id: number; name: string }; }

interface TimeEntry {
    id: number;
    hours: number;
    date: string;
    description: string | null;
    is_billable: boolean;
    task: Task;
}

interface Paginator<T> {
    data: T[];
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    entries: Paginator<TimeEntry>;
}

export default function TimeEntriesIndex({ entries }: Props) {
    return (
        <AppLayout>
            <Head title="My Time Log" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">My Time Log</h1>
                        <p className="mt-1 text-sm text-slate-500">{entries.total} entries total</p>
                    </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Task</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Project</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Hours</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Billable</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {entries.data.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm">
                                        <Link href={`/pm/projects/${entry.task.project.id}/tasks/${entry.task.id}`} className="text-indigo-600 hover:text-indigo-800">
                                            {entry.task.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        <Link href={`/pm/projects/${entry.task.project.id}`} className="text-indigo-600 hover:text-indigo-800">
                                            {entry.task.project.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{entry.hours}h</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{entry.date}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${entry.is_billable ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {entry.is_billable ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{entry.description ?? '—'}</td>
                                </tr>
                            ))}
                            {entries.data.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">No time entries yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

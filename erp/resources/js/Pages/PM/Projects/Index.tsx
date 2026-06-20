import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Manager { id: number; name: string; }

interface Project {
    id: number;
    name: string;
    code: string | null;
    status: string;
    priority: string;
    manager: Manager | null;
    tasks_count: number;
    members_count: number;
    start_date: string | null;
    end_date: string | null;
}

interface Paginator<T> {
    data: T[];
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    projects: Paginator<Project>;
    filters: { search?: string; status?: string };
}

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-800',
    active:    'bg-green-100 text-green-800',
    on_hold:   'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
};

const priorityBadge: Record<string, string> = {
    low:      'bg-slate-100 text-slate-600',
    medium:   'bg-blue-100 text-blue-700',
    high:     'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

export default function ProjectsIndex({ projects, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/pm/projects', { search, status }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Projects" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
                        <p className="mt-1 text-sm text-slate-500">{projects.total} projects total</p>
                    </div>
                    <Link href="/pm/projects/create">
                        <Button>New Project</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name or code..."
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                            />
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                            >
                                <option value="">All statuses</option>
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <Button type="submit" variant="secondary" size="sm">Filter</Button>
                        </form>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Project</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Priority</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Manager</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Tasks</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Members</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Start</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">End</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {projects.data.map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm">
                                            <Link href={`/pm/projects/${project.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                                {project.name}
                                            </Link>
                                            {project.code && (
                                                <span className="ml-1 text-xs text-slate-400">{project.code}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[project.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${priorityBadge[project.priority] ?? 'bg-slate-100 text-slate-800'}`}>
                                                {project.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{project.manager?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{project.tasks_count}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{project.members_count}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{project.start_date ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{project.end_date ?? '—'}</td>
                                    </tr>
                                ))}
                                {projects.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">No projects found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

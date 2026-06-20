import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Project } from '@/types/finance';

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    projects: Paginator<Project>;
    filters: { status?: string };
}

const statusColors: Record<string, string> = {
    planning:  'bg-slate-100 text-slate-600',
    active:    'bg-green-50 text-green-700',
    on_hold:   'bg-yellow-50 text-yellow-700',
    completed: 'bg-blue-50 text-blue-700',
    cancelled: 'bg-red-50 text-red-700',
};

export default function ProjectIndex({ projects, filters }: Props) {
    const { data, setData, get } = useForm({ status: filters.status ?? '' });

    function applyFilter() {
        get('/finance/projects', { preserveScroll: true, preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Projects" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
                    <Link href="/finance/projects/create"><Button>New Project</Button></Link>
                </div>

                {/* Filters */}
                <div className="flex gap-3 items-end">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">All</option>
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="on_hold">On Hold</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <Button type="button" variant="secondary" onClick={applyFilter}>Filter</Button>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Budget</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Hours</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Completion %</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {projects.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No projects yet. Create one to get started.
                                    </td>
                                </tr>
                            )}
                            {projects.data.map((project) => (
                                <tr key={project.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        {project.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {project.contact?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[project.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                                        {project.budget != null ? Number(project.budget).toFixed(2) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                                        {Number(project.total_hours ?? 0).toFixed(1)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                                        {Number(project.completion_percent ?? 0).toFixed(1)}%
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        <Link href={`/finance/projects/${project.id}`} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {projects.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {projects.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-3 py-1 rounded text-sm text-slate-400"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

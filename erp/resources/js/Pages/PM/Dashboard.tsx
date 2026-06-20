import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Stats {
    total_projects: number;
    active_projects: number;
    draft_projects: number;
    on_hold_projects: number;
    completed_projects: number;
    cancelled_projects: number;
    total_tasks: number;
    overdue_tasks: number;
    hours_this_month: number;
}

interface RecentProject {
    id: number;
    name: string;
    code: string | null;
    status: string;
    priority: string;
    tasks_count: number;
    manager: { id: number; name: string } | null;
    start_date: string | null;
    end_date: string | null;
}

interface Props extends PageProps {
    stats: Stats;
    recentProjects: RecentProject[];
}

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-800',
    active:    'bg-green-100 text-green-800',
    on_hold:   'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function PMDashboard({ stats, recentProjects }: Props) {
    const kpiCards = [
        { label: 'Total Projects',    value: stats.total_projects,    color: 'text-indigo-600' },
        { label: 'Active Projects',   value: stats.active_projects,   color: 'text-green-600' },
        { label: 'Total Tasks',       value: stats.total_tasks,       color: 'text-blue-600' },
        { label: 'Overdue Tasks',     value: stats.overdue_tasks,     color: 'text-red-600' },
        { label: 'Hours This Month',  value: `${stats.hours_this_month}h`, color: 'text-purple-600' },
    ];

    return (
        <AppLayout>
            <Head title="PM Dashboard" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Project Management</h1>
                    <Link href="/pm/projects/create">
                        <Button>New Project</Button>
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {kpiCards.map((card) => (
                        <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-medium uppercase text-slate-500">{card.label}</p>
                            <p className={`mt-2 text-2xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Projects */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Recent Projects</h2>
                        <Link href="/pm/projects" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Project</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Manager</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Tasks</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">End Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {recentProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm">
                                        <Link href={`/pm/projects/${project.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                            {project.name}
                                        </Link>
                                        {project.code && (
                                            <span className="ml-2 text-xs text-slate-400">{project.code}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[project.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{project.manager?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{project.tasks_count}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{project.end_date ?? '—'}</td>
                                </tr>
                            ))}
                            {recentProjects.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No projects yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

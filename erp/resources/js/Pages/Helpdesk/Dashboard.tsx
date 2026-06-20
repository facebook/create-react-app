import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    openTickets: number;
    overdueCount: number;
    avgResolutionHours: number;
    resolvedToday: number;
}

interface RecentTicket {
    id: number;
    ticket_number: string | null;
    subject: string;
    priority: string;
    status: string;
    assignee: { id: number; name: string } | null;
    created_at: string;
}

interface Props extends PageProps {
    stats: Stats;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
    recentTickets: RecentTicket[];
}

const priorityBadge: Record<string, string> = {
    low:    'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

const statusBadge: Record<string, string> = {
    open:        'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    pending:     'bg-yellow-100 text-yellow-700',
    resolved:    'bg-green-100 text-green-700',
    closed:      'bg-slate-100 text-slate-700',
};

const priorityDot: Record<string, string> = {
    low:    'bg-blue-500',
    medium: 'bg-yellow-500',
    high:   'bg-orange-500',
    urgent: 'bg-red-500',
};

const priorities = ['low', 'medium', 'high', 'urgent'];
const statuses   = ['open', 'in_progress', 'pending', 'resolved', 'closed'];

export default function HelpdeskDashboard({ stats, byPriority, byStatus, recentTickets }: Props) {
    const kpis = [
        { label: 'Open Tickets',      value: stats.openTickets,        color: 'text-blue-600' },
        { label: 'Overdue',           value: stats.overdueCount,       color: 'text-red-600' },
        { label: 'Avg Resolution (h)', value: stats.avgResolutionHours, color: 'text-indigo-600' },
        { label: 'Resolved Today',    value: stats.resolvedToday,      color: 'text-green-600' },
    ];

    return (
        <AppLayout>
            <Head title="Helpdesk Dashboard" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Helpdesk Dashboard</h1>
                    <Link href="/helpdesk/tickets/create" className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        New Ticket
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {kpis.map((kpi) => (
                        <div key={kpi.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-medium uppercase text-slate-500">{kpi.label}</p>
                            <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Priority Breakdown */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-base font-semibold text-slate-800">Tickets by Priority</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Priority</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Open Tickets</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {priorities.map((p) => (
                                        <tr key={p} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm flex items-center gap-2">
                                                <span className={`inline-block h-2.5 w-2.5 rounded-full ${priorityDot[p]}`} />
                                                <span className="capitalize">{p}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                                                {byPriority[p] ?? 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-base font-semibold text-slate-800">Tickets by Status</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {statuses.map((s) => (
                                        <tr key={s} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusBadge[s]}`}>
                                                    {s.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                                                {byStatus[s] ?? 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-slate-800">Recent Tickets</h2>
                        <Link href="/helpdesk/tickets" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Number</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Subject</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Priority</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Assignee</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentTickets.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No tickets yet</td>
                                    </tr>
                                )}
                                {recentTickets.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm">
                                            <Link href={`/helpdesk/tickets/${t.id}`} className="font-mono text-xs text-indigo-600 hover:text-indigo-800">
                                                {t.ticket_number ?? `#${t.id}`}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-800 max-w-[200px] truncate">
                                            <Link href={`/helpdesk/tickets/${t.id}`} className="hover:text-indigo-600">{t.subject}</Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${priorityBadge[t.priority] ?? priorityBadge.medium}`}>
                                                {t.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusBadge[t.status] ?? statusBadge.open}`}>
                                                {t.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{t.assignee?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{t.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

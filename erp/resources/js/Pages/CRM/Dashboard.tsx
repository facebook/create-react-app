import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    totalLeads: number;
    totalOpportunities: number;
    totalExpectedRevenue: number;
    wonThisMonth: number;
    wonRevenueThisMonth: number;
    conversionRate: number;
}

interface PipelineStage {
    id: number;
    name: string;
    color: string | null;
    lead_count: number;
    expected_revenue_sum: number | null;
}

interface RecentLead {
    id: number;
    reference: string | null;
    title: string;
    status: string;
    priority: string;
    expected_close_date: string | null;
    stage: { id: number; name: string } | null;
    assignee: { id: number; name: string } | null;
}

interface Props extends PageProps {
    stats: Stats;
    pipelineByStage: PipelineStage[];
    recentLeads: RecentLead[];
}

const priorityBadge: Record<string, string> = {
    low:    'bg-slate-100 text-slate-700',
    normal: 'bg-blue-100 text-blue-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

const statusBadge: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    won:  'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
};

function fmt(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function CrmDashboard({ stats, pipelineByStage, recentLeads }: Props) {
    const kpis = [
        { label: 'Open Leads',         value: stats.totalLeads,                        color: 'text-blue-600' },
        { label: 'Open Opportunities', value: stats.totalOpportunities,                color: 'text-indigo-600' },
        { label: 'Expected Revenue',   value: fmt(stats.totalExpectedRevenue),          color: 'text-emerald-600' },
        { label: 'Won This Month',     value: stats.wonThisMonth,                      color: 'text-green-600' },
        { label: 'Won Revenue/Month',  value: fmt(stats.wonRevenueThisMonth),           color: 'text-teal-600' },
        { label: 'Conversion Rate',    value: `${stats.conversionRate}%`,              color: 'text-purple-600' },
    ];

    return (
        <AppLayout>
            <Head title="CRM Dashboard" />
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">CRM Dashboard</h1>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {kpis.map((kpi) => (
                        <div key={kpi.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-medium uppercase text-slate-500">{kpi.label}</p>
                            <p className={`mt-2 text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Pipeline by Stage */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-base font-semibold text-slate-800">Pipeline by Stage</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Stage</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Leads</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Expected Rev.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pipelineByStage.map((stage) => (
                                        <tr key={stage.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-800 flex items-center gap-2">
                                                {stage.color && (
                                                    <span
                                                        className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: stage.color }}
                                                    />
                                                )}
                                                {stage.name}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-slate-700">{stage.lead_count}</td>
                                            <td className="px-4 py-3 text-right text-sm text-slate-700">
                                                {fmt(stage.expected_revenue_sum ?? 0)}
                                            </td>
                                        </tr>
                                    ))}
                                    {pipelineByStage.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">No stages configured</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Leads */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-800">Recent Leads</h2>
                            <Link href="/crm/leads" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Reference</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Title</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Stage</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Priority</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Close Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm">
                                                <Link href={`/crm/leads/${lead.id}`} className="text-indigo-600 hover:text-indigo-800 font-mono text-xs">
                                                    {lead.reference ?? `#${lead.id}`}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-800 max-w-[140px] truncate">{lead.title}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{lead.stage?.name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${priorityBadge[lead.priority] ?? priorityBadge.normal}`}>
                                                    {lead.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{lead.expected_close_date ?? '—'}</td>
                                        </tr>
                                    ))}
                                    {recentLeads.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No leads yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

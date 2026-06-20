import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Stats {
    totalSubscribers: number;
    activeSubscribers: number;
    totalCampaigns: number;
    campaignsSentThisMonth: number;
    avgOpenRate: number;
    avgClickRate: number;
}

interface RecentCampaign {
    id: number;
    name: string;
    subject: string;
    status: string;
    list_name: string | null;
    total_recipients: number;
    open_rate: number;
    click_rate: number;
    sent_at: string | null;
}

interface Props extends PageProps {
    stats: Stats;
    recentCampaigns: RecentCampaign[];
}

const statusColors: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    scheduled: 'bg-blue-100 text-blue-700',
    sending:   'bg-yellow-100 text-yellow-700',
    sent:      'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function MarketingDashboard({ stats, recentCampaigns }: Props) {
    const kpis = [
        { label: 'Total Subscribers',    value: stats.totalSubscribers,         color: 'text-slate-700' },
        { label: 'Active Subscribers',   value: stats.activeSubscribers,        color: 'text-green-600' },
        { label: 'Campaigns Sent (Month)', value: stats.campaignsSentThisMonth, color: 'text-indigo-600' },
        { label: 'Avg Open Rate',        value: `${stats.avgOpenRate}%`,        color: 'text-blue-600' },
    ];

    return (
        <AppLayout>
            <Head title="Marketing Dashboard" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Marketing Dashboard</h1>
                    <Link href="/marketing/campaigns/create"><Button>New Campaign</Button></Link>
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

                {/* Recent Campaigns */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Recent Campaigns</h2>
                        <Link href="/marketing/campaigns" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Subject</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Recipients</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Open Rate</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Click Rate</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Sent At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentCampaigns.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No campaigns yet</td>
                                    </tr>
                                )}
                                {recentCampaigns.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium">
                                            <Link href={`/marketing/campaigns/${c.id}`} className="text-indigo-600 hover:text-indigo-800">{c.name}</Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{c.subject}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[c.status] ?? statusColors.draft}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">{c.total_recipients}</td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">{c.open_rate}%</td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">{c.click_rate}%</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{c.sent_at ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Link href="/marketing/campaigns" className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm hover:bg-slate-50 transition-colors">
                        <p className="text-sm font-medium text-slate-700">Campaigns</p>
                    </Link>
                    <Link href="/marketing/mailing-lists" className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm hover:bg-slate-50 transition-colors">
                        <p className="text-sm font-medium text-slate-700">Mailing Lists</p>
                    </Link>
                    <Link href="/marketing/subscribers" className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm hover:bg-slate-50 transition-colors">
                        <p className="text-sm font-medium text-slate-700">Subscribers</p>
                    </Link>
                    <Link href="/marketing/campaigns/create" className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-center shadow-sm hover:bg-indigo-100 transition-colors">
                        <p className="text-sm font-medium text-indigo-700">New Campaign</p>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

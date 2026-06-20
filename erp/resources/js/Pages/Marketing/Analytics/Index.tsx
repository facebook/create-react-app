import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useMemo } from 'react';

interface CampaignStat {
    id: number;
    name: string;
    status: string;
    sent: number;
    opens: number;
    clicks: number;
    open_rate: number;
    click_rate: number;
}

interface Props {
    campaigns: CampaignStat[];
}

const statusColors: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-600',
    scheduled: 'bg-blue-100 text-blue-700',
    sending:   'bg-yellow-100 text-yellow-700',
    sent:      'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};

function openRateColor(rate: number): string {
    if (rate >= 25) return 'text-green-600';
    if (rate >= 15) return 'text-yellow-600';
    return 'text-red-600';
}

function openRateBarColor(rate: number): string {
    if (rate >= 25) return 'bg-green-500';
    if (rate >= 15) return 'bg-yellow-500';
    return 'bg-red-400';
}

export default function AnalyticsIndex({ campaigns }: Props) {
    const summary = useMemo(() => {
        const total       = campaigns.length;
        const totalSent   = campaigns.reduce((s, c) => s + c.sent, 0);
        const avgOpenRate = total > 0
            ? Math.round(campaigns.reduce((s, c) => s + c.open_rate, 0) / total * 10) / 10
            : 0;
        const avgClickRate = total > 0
            ? Math.round(campaigns.reduce((s, c) => s + c.click_rate, 0) / total * 10) / 10
            : 0;
        return { total, totalSent, avgOpenRate, avgClickRate };
    }, [campaigns]);

    return (
        <AppLayout>
            <Head title="Marketing Analytics" />

            <div className="p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Marketing Analytics</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Email campaign performance overview</p>
                    </div>
                    <Link
                        href="/marketing/campaigns"
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        All Campaigns &rarr;
                    </Link>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Campaigns</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{summary.total}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Sent</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{summary.totalSent.toLocaleString()}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Avg Open Rate</p>
                        <p className={`text-3xl font-bold mt-1 ${openRateColor(summary.avgOpenRate)}`}>
                            {summary.avgOpenRate}%
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Avg Click Rate</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{summary.avgClickRate}%</p>
                    </div>
                </div>

                {/* Campaign table */}
                {campaigns.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <p>No campaign data yet. Send campaigns to see analytics here.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Opens</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Clicks</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Rate</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Click Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-slate-50/50">
                                        <td className="px-5 py-3">
                                            <Link
                                                href={`/marketing/campaigns/${campaign.id}`}
                                                className="text-sm font-medium text-slate-800 hover:text-blue-600"
                                            >
                                                {campaign.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[campaign.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">
                                            {campaign.sent.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">
                                            {campaign.opens.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">
                                            {campaign.clicks.toLocaleString()}
                                        </td>
                                        {/* Open rate with color + bar */}
                                        <td className="px-4 py-3 min-w-[120px]">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-semibold w-12 text-right ${openRateColor(campaign.open_rate)}`}>
                                                    {campaign.open_rate}%
                                                </span>
                                                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${openRateBarColor(campaign.open_rate)}`}
                                                        style={{ width: `${Math.min(campaign.open_rate, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        {/* Click rate bar */}
                                        <td className="px-4 py-3 min-w-[120px]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold w-12 text-right text-blue-600">
                                                    {campaign.click_rate}%
                                                </span>
                                                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-blue-400"
                                                        style={{ width: `${Math.min(campaign.click_rate * 3, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

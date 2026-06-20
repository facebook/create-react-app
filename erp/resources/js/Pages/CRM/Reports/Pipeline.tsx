import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stage {
    id: number; name: string; color: string | null; sequence: number;
    lead_count: number; opportunity_count: number;
    expected_revenue_sum: number | null; avg_probability: number | null;
}
interface Props extends PageProps { stages: Stage[] }

function fmt(n: number) {
    return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
}

export default function PipelineReport({ stages }: Props) {
    const totalLeads = stages.reduce((s, st) => s + st.lead_count, 0);
    const totalOpps  = stages.reduce((s, st) => s + st.opportunity_count, 0);
    const totalRev   = stages.reduce((s, st) => s + (st.expected_revenue_sum ?? 0), 0);

    return (
        <AppLayout>
            <Head title="Pipeline Report" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Pipeline Report</h1>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label:'Total Leads', value: totalLeads },
                        { label:'Total Opportunities', value: totalOpps },
                        { label:'Total Expected Revenue', value: fmt(totalRev) },
                    ].map(kpi => (
                        <div key={kpi.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm text-center">
                            <p className="text-sm text-slate-500">{kpi.label}</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Stage</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Leads</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Opportunities</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Exp. Revenue</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Avg Probability</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {stages.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No data.</td></tr>
                            )}
                            {stages.map((stage) => (
                                <tr key={stage.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900 flex items-center gap-2">
                                        {stage.color && <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />}
                                        {stage.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{stage.lead_count}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{stage.opportunity_count}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{fmt(stage.expected_revenue_sum ?? 0)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">
                                        {stage.avg_probability != null ? `${Math.round(stage.avg_probability)}%` : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

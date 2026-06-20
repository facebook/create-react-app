import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface SourceRow {
    source_name: string; total_count: number; lead_count: number;
    opportunity_count: number; won_count: number; total_revenue: number; win_rate: number;
}
interface Props extends PageProps { sources: SourceRow[] }

function fmt(n: number) {
    return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
}

export default function SourceReport({ sources }: Props) {
    return (
        <AppLayout>
            <Head title="Source Report" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Source Report</h1>
                    <p className="text-sm text-slate-500 mt-1">Leads &amp; opportunities by acquisition source</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Source</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Total</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Leads</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Opportunities</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Won</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Revenue</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Win Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {sources.length === 0 && (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No data.</td></tr>
                            )}
                            {sources.map((row) => (
                                <tr key={row.source_name} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900 capitalize">{row.source_name.replace('_',' ')}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{row.total_count}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{row.lead_count}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{row.opportunity_count}</td>
                                    <td className="px-4 py-3 text-sm text-right text-green-700">{row.won_count}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{fmt(row.total_revenue)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{row.win_rate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

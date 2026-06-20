import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface MonthRow {
    month: string; won: number; lost: number; won_revenue: number; conversion_rate: number;
}
interface Totals { won: number; lost: number; won_revenue: number }
interface Props extends PageProps { months: MonthRow[]; totals: Totals }

function fmt(n: number) {
    return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
}

export default function WinLossReport({ months, totals }: Props) {
    return (
        <AppLayout>
            <Head title="Win/Loss Report" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Win / Loss Report</h1>
                    <p className="text-sm text-slate-500 mt-1">Last 6 months</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label:'Won (6 mo)', value: totals.won, cls:'text-green-600' },
                        { label:'Lost (6 mo)', value: totals.lost, cls:'text-red-600' },
                        { label:'Won Revenue (6 mo)', value: fmt(totals.won_revenue), cls:'text-emerald-600' },
                    ].map(k => (
                        <div key={k.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm text-center">
                            <p className="text-sm text-slate-500">{k.label}</p>
                            <p className={`text-3xl font-bold mt-1 ${k.cls}`}>{k.value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Month</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Won</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Lost</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Won Revenue</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Conversion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {months.map((row) => (
                                <tr key={row.month} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.month}</td>
                                    <td className="px-4 py-3 text-sm text-right text-green-700">{row.won}</td>
                                    <td className="px-4 py-3 text-sm text-right text-red-700">{row.lost}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{fmt(row.won_revenue)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{row.conversion_rate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface CashItem { reference: string; contact: string; due_date: string; amount: number; }
interface Bucket {
    week_start: string; week_end: string;
    inflows: CashItem[]; outflows: CashItem[];
    total_inflow: number; total_outflow: number; net: number; closing_balance: number;
}
interface Props {
    buckets: Bucket[]; openingBalance: number; weeks: number;
    totalInflow: number; totalOutflow: number;
}

export default function CashFlowForecast({ buckets, openingBalance, weeks, totalInflow, totalOutflow }: Props) {
    const [weeksInput, setWeeksInput] = useState(weeks);
    const [balanceInput, setBalanceInput] = useState(openingBalance);
    const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

    function reload() {
        router.get('/finance/reports/cash-flow-forecast', {
            weeks: weeksInput,
            opening_balance: balanceInput,
        }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Cash Flow Forecast" />
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h1 className="text-2xl font-bold text-slate-800">Cash Flow Forecast</h1>
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-slate-600">Weeks:</label>
                        <input type="number" min={1} max={52} value={weeksInput}
                            onChange={e => setWeeksInput(+e.target.value)}
                            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm" />
                        <label className="text-sm text-slate-600">Opening Balance:</label>
                        <input type="number" step="0.01" value={balanceInput}
                            onChange={e => setBalanceInput(+e.target.value)}
                            className="w-32 rounded border border-slate-300 px-2 py-1 text-sm" />
                        <button onClick={reload}
                            className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                            Refresh
                        </button>
                        <a href={`/finance/reports/cash-flow-forecast/export?weeks=${weeksInput}&opening_balance=${balanceInput}`}
                           className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            Export CSV
                        </a>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Total Inflows</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">{fmt(totalInflow)}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Total Outflows</p>
                        <p className="text-2xl font-bold text-red-700 mt-1">{fmt(totalOutflow)}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">Net</p>
                        <p className={`text-2xl font-bold mt-1 ${totalInflow - totalOutflow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {fmt(totalInflow - totalOutflow)}
                        </p>
                    </div>
                </div>

                {/* Weekly table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Week</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Inflows</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Outflows</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Net</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {buckets.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No data in forecast horizon.</td></tr>
                            )}
                            {buckets.map((b) => (
                                <tr key={b.week_start} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-700 font-medium">
                                        {b.week_start} &ndash; {b.week_end}
                                    </td>
                                    <td className="px-4 py-3 text-right text-green-700 font-medium">{fmt(b.total_inflow)}</td>
                                    <td className="px-4 py-3 text-right text-red-700 font-medium">{fmt(b.total_outflow)}</td>
                                    <td className={`px-4 py-3 text-right font-semibold ${b.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {fmt(b.net)}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-bold ${b.closing_balance >= 0 ? 'text-slate-800' : 'text-red-700'}`}>
                                        {fmt(b.closing_balance)}
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

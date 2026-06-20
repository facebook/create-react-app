import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface AccountRow {
    id: number;
    code: string;
    name: string;
    net: number;
}

interface Props extends PageProps {
    revenue: AccountRow[];
    expenses: AccountRow[];
    total_revenue: number;
    total_expenses: number;
    net: number;
    from: string;
    to: string;
}

export default function ProfitLoss({ revenue, expenses, total_revenue, total_expenses, net, from, to }: Props) {
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo, setDateTo] = useState(to);

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get('/finance/reports/profit-loss', { from: dateFrom, to: dateTo }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Profit & Loss" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Profit &amp; Loss</h1>
                        <p className="text-sm text-slate-500 mt-1">Income Statement — posted entries only</p>
                    </div>
                </div>

                {/* Date filter */}
                <form onSubmit={applyFilter} className="flex items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">From</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">To</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <button type="submit" className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">Apply</button>
                    <a
                      href={`/finance/reports/profit-loss/export?from=${dateFrom}&to=${dateTo}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    >
                      Export CSV
                    </a>
                </form>

                {/* Revenue section */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-green-50 px-4 py-3">
                        <h2 className="text-sm font-semibold text-green-800">Revenue</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium w-24">Code</th>
                                <th className="px-4 py-2 text-left font-medium">Account</th>
                                <th className="px-4 py-2 text-right font-medium w-32">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {revenue.length === 0 ? (
                                <tr><td colSpan={3} className="px-4 py-4 text-center text-slate-400">No revenue accounts</td></tr>
                            ) : revenue.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 font-mono text-slate-500">{row.code}</td>
                                    <td className="px-4 py-2 text-slate-800">{row.name}</td>
                                    <td className="px-4 py-2 text-right">{row.net.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                            <tr>
                                <td colSpan={2} className="px-4 py-2 text-slate-900">Total Revenue</td>
                                <td className="px-4 py-2 text-right text-green-700">{total_revenue.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Expenses section */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-red-50 px-4 py-3">
                        <h2 className="text-sm font-semibold text-red-800">Expenses</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium w-24">Code</th>
                                <th className="px-4 py-2 text-left font-medium">Account</th>
                                <th className="px-4 py-2 text-right font-medium w-32">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {expenses.length === 0 ? (
                                <tr><td colSpan={3} className="px-4 py-4 text-center text-slate-400">No expense accounts</td></tr>
                            ) : expenses.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 font-mono text-slate-500">{row.code}</td>
                                    <td className="px-4 py-2 text-slate-800">{row.name}</td>
                                    <td className="px-4 py-2 text-right">{row.net.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                            <tr>
                                <td colSpan={2} className="px-4 py-2 text-slate-900">Total Expenses</td>
                                <td className="px-4 py-2 text-right text-red-700">{total_expenses.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Summary */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Total Revenue</span>
                        <span className="font-medium text-green-700">{total_revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Total Expenses</span>
                        <span className="font-medium text-red-700">({total_expenses.toFixed(2)})</span>
                    </div>
                    <div className="flex items-center justify-between py-3 mt-1">
                        <span className="text-base font-semibold text-slate-900">Net {net >= 0 ? 'Profit' : 'Loss'}</span>
                        <span className={`text-lg font-bold ${net >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            {net.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

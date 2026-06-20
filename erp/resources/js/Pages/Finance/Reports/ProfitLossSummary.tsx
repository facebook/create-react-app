import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface AccountRow {
    id: number;
    code: string;
    name: string;
    type: string;
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

function fmt(n: number) {
    return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ProfitLossSummary({ revenue, expenses, total_revenue, total_expenses, net, from, to }: Props) {
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo, setDateTo] = useState(to);

    function applyFilter() {
        router.get('/finance/reports/profit-loss', { from: dateFrom, to: dateTo }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Profit & Loss Summary" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Profit & Loss Summary</h1>
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-slate-500">From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <label className="text-sm text-slate-500">To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={applyFilter}
                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Apply
                        </button>
                        <a
                            href={`/finance/reports/profit-loss/export?from=${dateFrom}&to=${dateTo}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                        >
                            Export CSV
                        </a>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Total Revenue</p>
                        <p className="mt-1 text-2xl font-bold text-green-600">{fmt(total_revenue)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Total Expenses</p>
                        <p className="mt-1 text-2xl font-bold text-red-600">{fmt(total_expenses)}</p>
                    </div>
                    <div className={`rounded-lg border p-4 shadow-sm ${net >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <p className="text-sm text-slate-500">Net Profit / Loss</p>
                        <p className={`mt-1 text-2xl font-bold ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(net)}</p>
                    </div>
                </div>

                {/* Revenue table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <h2 className="text-sm font-medium text-slate-700">Revenue</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Code</th>
                                <th className="px-4 py-2 text-left font-medium">Account</th>
                                <th className="px-4 py-2 text-right font-medium">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {revenue.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-4 text-center text-sm text-slate-400">
                                        No revenue for this period.
                                    </td>
                                </tr>
                            )}
                            {revenue.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-slate-600">{row.code}</td>
                                    <td className="px-4 py-3 text-slate-900">{row.name}</td>
                                    <td className="px-4 py-3 text-right font-medium text-green-600">{fmt(row.net)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t border-slate-200 bg-slate-50">
                            <tr>
                                <td colSpan={2} className="px-4 py-3 text-right font-semibold text-slate-700">
                                    Total Revenue
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-green-700">{fmt(total_revenue)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Expenses table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <h2 className="text-sm font-medium text-slate-700">Expenses</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Code</th>
                                <th className="px-4 py-2 text-left font-medium">Account</th>
                                <th className="px-4 py-2 text-right font-medium">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {expenses.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-4 text-center text-sm text-slate-400">
                                        No expenses for this period.
                                    </td>
                                </tr>
                            )}
                            {expenses.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-slate-600">{row.code}</td>
                                    <td className="px-4 py-3 text-slate-900">{row.name}</td>
                                    <td className="px-4 py-3 text-right font-medium text-red-600">{fmt(row.net)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                            <tr>
                                <td colSpan={2} className="px-4 py-3 text-right font-semibold text-slate-700">
                                    Total Expenses
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-red-700">{fmt(total_expenses)}</td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="px-4 py-3 text-right font-semibold text-slate-700">
                                    Net Profit / Loss
                                </td>
                                <td className={`px-4 py-3 text-right font-bold ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {fmt(net)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

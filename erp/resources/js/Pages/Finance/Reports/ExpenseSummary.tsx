import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface ExpenseRow {
    id: number;
    code: string;
    name: string;
    type: string;
    net: number;
}

interface Props extends PageProps {
    expenses: ExpenseRow[];
    total_expenses: number;
    from: string;
    to: string;
}

function fmt(n: number) {
    return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ExpenseSummary({ expenses, total_expenses, from, to }: Props) {
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo, setDateTo] = useState(to);

    function applyFilter() {
        router.get('/finance/reports/expenses', { from: dateFrom, to: dateTo }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Expense Summary" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Expense Summary</h1>
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
                    </div>
                </div>

                {/* Summary card */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Total Expenses</p>
                        <p className="mt-1 text-2xl font-bold text-red-600">{fmt(total_expenses)}</p>
                        <p className="mt-1 text-xs text-slate-400">
                            {dateFrom} to {dateTo}
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Expense Accounts</p>
                        <p className="mt-1 text-2xl font-bold text-slate-800">{expenses.length}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <h2 className="text-sm font-medium text-slate-700">Expenses by Account</h2>
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
                                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No expense data for this period.
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
                        </tfoot>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

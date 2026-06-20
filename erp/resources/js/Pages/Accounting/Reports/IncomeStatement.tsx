import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface AccountRow {
    id: number;
    code: string;
    name: string;
    total_debit: number;
    total_credit: number;
}

interface Props extends PageProps {
    revenue: AccountRow[];
    expenses: AccountRow[];
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    startDate: string;
    endDate: string;
}

export default function IncomeStatement({ revenue, expenses, totalRevenue, totalExpenses, netIncome, startDate, endDate }: Props) {
    const [dates, setDates] = useState({ start_date: startDate, end_date: endDate });

    function refresh() {
        router.get('/accounting/reports/income-statement', dates, { preserveState: true });
    }

    const isProfit = Number(netIncome) >= 0;

    return (
        <AppLayout>
            <Head title="Income Statement" />
            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Income Statement</h1>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={dates.start_date}
                            onChange={(e) => setDates({ ...dates, start_date: e.target.value })}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <span className="text-slate-500 text-sm">to</span>
                        <input
                            type="date"
                            value={dates.end_date}
                            onChange={(e) => setDates({ ...dates, end_date: e.target.value })}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <Button variant="secondary" onClick={refresh}>Refresh</Button>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                    {/* Revenue */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Revenue</h3>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-slate-100">
                                {revenue.map((acc) => (
                                    <tr key={acc.id}>
                                        <td className="py-1 text-slate-700">{acc.code} — {acc.name}</td>
                                        <td className="py-1 text-right font-mono text-slate-900">
                                            {(Number(acc.total_credit) - Number(acc.total_debit)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-slate-300 font-semibold">
                                    <td className="py-2 text-slate-700">Total Revenue</td>
                                    <td className="py-2 text-right font-mono text-green-700">{Number(totalRevenue).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Expenses */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Expenses</h3>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-slate-100">
                                {expenses.map((acc) => (
                                    <tr key={acc.id}>
                                        <td className="py-1 text-slate-700">{acc.code} — {acc.name}</td>
                                        <td className="py-1 text-right font-mono text-slate-900">
                                            {(Number(acc.total_debit) - Number(acc.total_credit)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-slate-300 font-semibold">
                                    <td className="py-2 text-slate-700">Total Expenses</td>
                                    <td className="py-2 text-right font-mono text-red-700">{Number(totalExpenses).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Net Income */}
                    <div className={`rounded-md px-4 py-3 flex justify-between items-center font-bold text-base ${isProfit ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <span>{isProfit ? 'Net Income' : 'Net Loss'}</span>
                        <span className="font-mono">{Number(netIncome).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

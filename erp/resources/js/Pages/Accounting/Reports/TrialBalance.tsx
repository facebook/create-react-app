import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface AccountRow {
    id: number;
    code: string;
    name: string;
    type: string;
    total_debit: number;
    total_credit: number;
}

interface Props extends PageProps {
    accounts: AccountRow[];
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
    asOf: string;
}

export default function TrialBalance({ accounts, totalDebits, totalCredits, isBalanced, asOf }: Props) {
    const [date, setDate] = useState(asOf);

    function refresh() {
        router.get('/accounting/reports/trial-balance', { as_of: date }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Trial Balance" />
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Trial Balance</h1>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">As of</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <Button variant="secondary" onClick={refresh}>Refresh</Button>
                    </div>
                </div>

                <div className={`rounded-md px-4 py-3 text-sm font-medium ${isBalanced ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {isBalanced ? 'Balanced' : 'Unbalanced — Debits and Credits do not match'}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Code</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Account Name</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Debit</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {accounts.map((acc) => (
                                <tr key={acc.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 font-mono text-slate-700">{acc.code}</td>
                                    <td className="px-4 py-2 text-slate-900">{acc.name}</td>
                                    <td className="px-4 py-2 text-slate-500 capitalize">{acc.type}</td>
                                    <td className="px-4 py-2 text-right font-mono text-slate-900">
                                        {acc.total_debit > 0 ? Number(acc.total_debit).toFixed(2) : '—'}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono text-slate-900">
                                        {acc.total_credit > 0 ? Number(acc.total_credit).toFixed(2) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                                <td colSpan={3} className="px-4 py-3 text-right text-slate-700">Totals</td>
                                <td className="px-4 py-3 text-right font-mono text-slate-900">{Number(totalDebits).toFixed(2)}</td>
                                <td className="px-4 py-3 text-right font-mono text-slate-900">{Number(totalCredits).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    {accounts.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No account activity for this period.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

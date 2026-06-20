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
    assets: AccountRow[];
    liabilities: AccountRow[];
    equity: AccountRow[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    asOf: string;
}

function Section({ title, accounts, getBalance }: {
    title: string;
    accounts: AccountRow[];
    getBalance: (a: AccountRow) => number;
}) {
    const subtotal = accounts.reduce((s, a) => s + getBalance(a), 0);
    return (
        <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">{title}</h3>
            <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                    {accounts.map((acc) => (
                        <tr key={acc.id}>
                            <td className="py-1 text-slate-700">{acc.code} — {acc.name}</td>
                            <td className="py-1 text-right font-mono text-slate-900">{getBalance(acc).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t border-slate-300 font-semibold">
                        <td className="py-2 text-slate-700">Total {title}</td>
                        <td className="py-2 text-right font-mono text-slate-900">{subtotal.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

export default function BalanceSheet({ assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity, asOf }: Props) {
    const [date, setDate] = useState(asOf);

    function refresh() {
        router.get('/accounting/reports/balance-sheet', { as_of: date }, { preserveState: true });
    }

    const totalLiabEquity = Number(totalLiabilities) + Number(totalEquity);
    const isBalanced = Math.abs(Number(totalAssets) - totalLiabEquity) < 0.01;

    return (
        <AppLayout>
            <Head title="Balance Sheet" />
            <div className="mx-auto max-w-6xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Balance Sheet</h1>
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

                {!isBalanced && (
                    <div className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-700">
                        Warning: Total Assets ({Number(totalAssets).toFixed(2)}) ≠ Total Liabilities + Equity ({totalLiabEquity.toFixed(2)})
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    {/* Left: Assets */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <Section
                            title="Assets"
                            accounts={assets}
                            getBalance={(a) => Number(a.total_debit) - Number(a.total_credit)}
                        />
                        <div className="mt-4 border-t-2 border-slate-900 pt-2 flex justify-between font-bold text-slate-900">
                            <span>Total Assets</span>
                            <span className="font-mono">{Number(totalAssets).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Right: Liabilities + Equity */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <Section
                            title="Liabilities"
                            accounts={liabilities}
                            getBalance={(a) => Number(a.total_credit) - Number(a.total_debit)}
                        />
                        <Section
                            title="Equity"
                            accounts={equity}
                            getBalance={(a) => Number(a.total_credit) - Number(a.total_debit)}
                        />
                        <div className="border-t-2 border-slate-900 pt-2 flex justify-between font-bold text-slate-900">
                            <span>Total Liabilities + Equity</span>
                            <span className="font-mono">{totalLiabEquity.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

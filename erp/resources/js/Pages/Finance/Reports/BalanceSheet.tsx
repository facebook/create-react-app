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
    assets: AccountRow[];
    liabilities: AccountRow[];
    equity: AccountRow[];
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    as_of: string;
}

function AccountSection({ title, rows, total, colorClass }: { title: string; rows: AccountRow[]; total: number; colorClass: string }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className={`border-b border-slate-200 px-4 py-3 ${colorClass}`}>
                <h2 className="text-sm font-semibold">{title}</h2>
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
                    {rows.length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-4 text-center text-slate-400">No accounts</td></tr>
                    ) : rows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-mono text-slate-500">{row.code}</td>
                            <td className="px-4 py-2 text-slate-800">{row.name}</td>
                            <td className="px-4 py-2 text-right">{row.net.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                    <tr>
                        <td colSpan={2} className="px-4 py-2 text-slate-900">Total {title}</td>
                        <td className="px-4 py-2 text-right text-slate-900">{total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

export default function BalanceSheet({ assets, liabilities, equity, total_assets, total_liabilities, total_equity, as_of }: Props) {
    const [asOf, setAsOf] = useState(as_of);

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get('/finance/reports/balance-sheet', { as_of: asOf }, { preserveState: true, replace: true });
    }

    const liabPlusEquity = total_liabilities + total_equity;
    const difference = Math.abs(total_assets - liabPlusEquity);
    const isBalanced = difference < 0.01;

    return (
        <AppLayout>
            <Head title="Balance Sheet" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Balance Sheet</h1>
                        <p className="text-sm text-slate-500 mt-1">Posted entries only</p>
                    </div>
                    {isBalanced ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            Balanced
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            Out of balance by {difference.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Date filter */}
                <form onSubmit={applyFilter} className="flex items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">As of</label>
                        <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <button type="submit" className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">Apply</button>
                    <a
                      href={`/finance/reports/balance-sheet/export?as_of=${asOf}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    >
                      Export CSV
                    </a>
                </form>

                <AccountSection title="Assets" rows={assets} total={total_assets} colorClass="bg-blue-50 text-blue-800" />
                <AccountSection title="Liabilities" rows={liabilities} total={total_liabilities} colorClass="bg-orange-50 text-orange-800" />
                <AccountSection title="Equity" rows={equity} total={total_equity} colorClass="bg-purple-50 text-purple-800" />

                {/* Summary */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-700 mb-3">Summary</h2>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Total Assets</span>
                        <span className="font-medium">{total_assets.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Total Liabilities</span>
                        <span className="font-medium">{total_liabilities.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Total Equity</span>
                        <span className="font-medium">{total_equity.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Liabilities + Equity</span>
                        <span className="font-medium">{liabPlusEquity.toFixed(2)}</span>
                    </div>
                    {!isBalanced && (
                        <div className="mt-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                            Warning: Assets ({total_assets.toFixed(2)}) do not equal Liabilities + Equity ({liabPlusEquity.toFixed(2)}). Difference: {difference.toFixed(2)}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface AccountInfo { id: number; code: string; name: string; type: string; }
interface LedgerRow { id: number; date: string; reference?: string; description: string; debit: number; credit: number; balance: number; }
interface Props extends PageProps {
    accounts: AccountInfo[];
    account: AccountInfo | null;
    rows: LedgerRow[];
    from: string;
    to: string;
}

function fmt(n: number) { return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function AccountLedger({ accounts, account, rows, from, to }: Props) {
    const [fromDate, setFromDate] = useState(from);
    const [toDate, setToDate] = useState(to);

    function applyFilter() {
        if (!account) return;
        router.get(`/finance/reports/account-ledger/${account.id}`, { from: fromDate, to: toDate }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Account Ledger" />
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">Account Ledger</h1>

                {/* Controls */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-500 whitespace-nowrap">Account</label>
                        <select value={account?.id ?? ''}
                            onChange={(e) => {
                                if (e.target.value) router.get(`/finance/reports/account-ledger/${e.target.value}`, { from: fromDate, to: toDate });
                            }}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Select account…</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                            ))}
                        </select>
                    </div>
                    {account && (
                        <>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-500">From</label>
                                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-500">To</label>
                                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <button onClick={applyFilter}
                                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                                Apply
                            </button>
                            <a
                              href={`/finance/reports/account-ledger/${account.id}/export?from=${fromDate}&to=${toDate}`}
                              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                            >
                              Export CSV
                            </a>
                        </>
                    )}
                </div>

                {account ? (
                    <>
                        <div className="text-sm text-slate-600">
                            <span className="font-mono font-medium">{account.code}</span> — {account.name}
                            <span className="ml-2 text-slate-400">({account.type})</span>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Date</th>
                                        <th className="px-4 py-2 text-left font-medium">Reference</th>
                                        <th className="px-4 py-2 text-left font-medium">Description</th>
                                        <th className="px-4 py-2 text-right font-medium">Debit</th>
                                        <th className="px-4 py-2 text-right font-medium">Credit</th>
                                        <th className="px-4 py-2 text-right font-medium">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rows.length === 0 && (
                                        <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No transactions in this period.</td></tr>
                                    )}
                                    {rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{row.date}</td>
                                            <td className="px-4 py-2 text-slate-500 font-mono text-xs">{row.reference ?? '—'}</td>
                                            <td className="px-4 py-2 text-slate-700">{row.description}</td>
                                            <td className="px-4 py-2 text-right text-slate-600">{row.debit > 0 ? fmt(row.debit) : ''}</td>
                                            <td className="px-4 py-2 text-right text-slate-600">{row.credit > 0 ? fmt(row.credit) : ''}</td>
                                            <td className={`px-4 py-2 text-right font-medium ${row.balance < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                                {fmt(Math.abs(row.balance))}{row.balance < 0 ? ' Cr' : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <p className="text-slate-400">Select an account above to view its transaction history.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

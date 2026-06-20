import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Account {
    id: number;
    code: string;
    name: string;
}

interface LedgerLine {
    id: number;
    description: string | null;
    debit: number;
    credit: number;
    running_balance: number;
    journal_entry: {
        id: number;
        entry_number: string | null;
        entry_date: string;
    };
}

interface Props extends PageProps {
    account: Account;
    lines: LedgerLine[];
    allAccounts: Account[];
}

export default function GeneralLedger({ account, lines, allAccounts }: Props) {
    const [selectedId, setSelectedId] = useState(account.id.toString());

    function changeAccount() {
        if (selectedId) {
            router.get(`/accounting/reports/general-ledger/${selectedId}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`General Ledger — ${account.code} ${account.name}`} />
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">General Ledger</h1>
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        >
                            {allAccounts.map((a) => (
                                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                            ))}
                        </select>
                        <Button variant="secondary" onClick={changeAccount}>View</Button>
                    </div>
                </div>

                <div className="rounded-md bg-slate-50 border border-slate-200 px-4 py-3">
                    <span className="font-mono font-semibold text-slate-900">{account.code}</span>
                    <span className="ml-2 text-slate-700">{account.name}</span>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Entry #</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Debit</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Credit</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {lines.map((line) => (
                                <tr key={line.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 text-slate-600">{line.journal_entry?.entry_date}</td>
                                    <td className="px-4 py-2 font-mono text-slate-700">
                                        {line.journal_entry?.entry_number ?? `#${line.journal_entry?.id}`}
                                    </td>
                                    <td className="px-4 py-2 text-slate-700">{line.description ?? '—'}</td>
                                    <td className="px-4 py-2 text-right font-mono text-slate-900">
                                        {line.debit > 0 ? Number(line.debit).toFixed(2) : '—'}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono text-slate-900">
                                        {line.credit > 0 ? Number(line.credit).toFixed(2) : '—'}
                                    </td>
                                    <td className={`px-4 py-2 text-right font-mono font-semibold ${line.running_balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                                        {Number(line.running_balance).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {lines.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No posted transactions for this account.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

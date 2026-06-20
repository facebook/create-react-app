import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import type { PageProps } from '@/types';
import type { BankAccount, BankTransaction } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    transactions: Paginator<BankTransaction>;
    accounts: BankAccount[];
    account_id: number | null;
}

interface MatchForm {
    payment_id: string;
    journal_entry_id: string;
}

export default function ReconciliationIndex({ transactions, accounts, account_id }: Props) {
    const [matchingTxn, setMatchingTxn] = useState<number | null>(null);
    const [matchForm, setMatchForm] = useState<MatchForm>({ payment_id: '', journal_entry_id: '' });

    function filterByAccount(e: React.ChangeEvent<HTMLSelectElement>) {
        const val = e.target.value;
        router.get('/finance/reconciliation', val ? { account_id: val } : {}, { preserveState: true, replace: true });
    }

    function handleMatch(txnId: number) {
        router.post(`/finance/reconciliation/${txnId}/match`, {
            payment_id: matchForm.payment_id || null,
            journal_entry_id: matchForm.journal_entry_id || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setMatchingTxn(null);
                setMatchForm({ payment_id: '', journal_entry_id: '' });
            },
        });
    }

    return (
        <AppLayout>
            <Head title="Reconciliation" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Bank Reconciliation</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {transactions.total} unreconciled transaction{transactions.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Account Filter */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700">Filter by Account:</label>
                    <select
                        value={account_id ?? ''}
                        onChange={filterByAccount}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="">All Accounts</option>
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                </div>

                {/* Transactions Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {transactions.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No unreconciled transactions.
                                    </td>
                                </tr>
                            )}
                            {transactions.data.map((txn) => (
                                <>
                                    <tr key={txn.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                            {typeof txn.transaction_date === 'string'
                                                ? txn.transaction_date
                                                : new Date(txn.transaction_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {txn.bank_account?.name ?? '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900">{txn.description ?? '-'}</td>
                                        <td className={`px-6 py-4 text-sm font-mono text-right font-medium ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {txn.amount >= 0 ? '+' : ''}{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {matchingTxn === txn.id ? (
                                                <button
                                                    onClick={() => setMatchingTxn(null)}
                                                    className="text-xs text-slate-500 hover:text-slate-700"
                                                >
                                                    Cancel
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { setMatchingTxn(txn.id); setMatchForm({ payment_id: '', journal_entry_id: '' }); }}
                                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Match
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {matchingTxn === txn.id && (
                                        <tr key={`match-${txn.id}`} className="bg-indigo-50">
                                            <td colSpan={5} className="px-6 py-4">
                                                <div className="flex items-end gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-700 mb-1">Payment ID</label>
                                                        <input
                                                            type="text"
                                                            value={matchForm.payment_id}
                                                            onChange={(e) => setMatchForm((f) => ({ ...f, payment_id: e.target.value }))}
                                                            className="w-36 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="e.g. 42"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-700 mb-1">Journal Entry ID</label>
                                                        <input
                                                            type="text"
                                                            value={matchForm.journal_entry_id}
                                                            onChange={(e) => setMatchForm((f) => ({ ...f, journal_entry_id: e.target.value }))}
                                                            className="w-36 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="e.g. 7"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={() => handleMatch(txn.id)}
                                                        disabled={!matchForm.payment_id && !matchForm.journal_entry_id}
                                                    >
                                                        Reconcile
                                                    </Button>
                                                    <button
                                                        onClick={() => setMatchingTxn(null)}
                                                        className="text-sm text-slate-500 hover:text-slate-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
                {transactions.last_page > 1 && (
                    <Pagination paginator={transactions} />
                )}
            </div>
        </AppLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import { useState } from 'react';
import type { PageProps } from '@/types';
import type { BankTransactionV2, BankAccountV2 } from '@/types/finance';

interface PaginatedTransactions {
    data: BankTransactionV2[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    transactions: PaginatedTransactions;
    bankAccounts: { id: number; name: string; bank_name: string }[];
    filters: { bank_account_id?: string };
}

export default function BankTransactionsIndex({ transactions, bankAccounts, filters }: Props) {
    const { can } = usePermission();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        bank_account_id: filters.bank_account_id ?? '',
        transaction_date: '',
        description: '',
        amount: '',
        type: 'credit',
        reference: '',
    });

    function handleFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
        router.get('/finance/bank-transactions', { bank_account_id: e.target.value }, { preserveState: true });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post('/finance/bank-transactions', form as any, {
            onSuccess: () => {
                setShowForm(false);
                setForm({ bank_account_id: filters.bank_account_id ?? '', transaction_date: '', description: '', amount: '', type: 'credit', reference: '' });
            },
        });
    }

    function toggleReconcile(id: number) {
        router.patch(`/finance/bank-transactions/${id}/reconcile`, {}, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="Bank Transactions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Bank Transactions</h1>
                        <p className="text-sm text-slate-500 mt-1">{transactions.total} transactions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filters.bank_account_id ?? ''}
                            onChange={handleFilterChange}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        >
                            <option value="">All Accounts</option>
                            {bankAccounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name} — {a.bank_name}</option>
                            ))}
                        </select>
                        {can('finance.create') && (
                            <Button onClick={() => setShowForm(!showForm)}>Add Transaction</Button>
                        )}
                    </div>
                </div>

                {showForm && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                        <h2 className="text-lg font-medium text-slate-900 mb-4">New Transaction</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Bank Account</label>
                                <select
                                    value={form.bank_account_id}
                                    onChange={e => setForm({ ...form, bank_account_id: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select account...</option>
                                    {bankAccounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={form.transaction_date}
                                    onChange={e => setForm({ ...form, transaction_date: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.amount}
                                    onChange={e => setForm({ ...form, amount: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                >
                                    <option value="credit">Credit</option>
                                    <option value="debit">Debit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                                <input
                                    type="text"
                                    value={form.reference}
                                    onChange={e => setForm({ ...form, reference: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="col-span-2 flex gap-3">
                                <Button type="submit">Save Transaction</Button>
                                <Button type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Reconciled</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {transactions.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                            {transactions.data.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-600">{tx.transaction_date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900">{tx.description}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{tx.account?.name ?? '-'}</td>
                                    <td className={`px-6 py-4 text-sm text-right font-mono font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tx.is_reconciled ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {tx.is_reconciled ? 'Reconciled' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm">
                                        {can('finance.create') && (
                                            <button
                                                onClick={() => toggleReconcile(tx.id)}
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                {tx.is_reconciled ? 'Unreconcile' : 'Reconcile'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

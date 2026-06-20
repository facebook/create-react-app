import React, { useState } from 'react';
import { router } from '@inertiajs/react';

interface Transaction {
    id: number;
    transaction_date: string;
    description: string | null;
    reference: string | null;
    type: 'debit' | 'credit';
    amount: number;
    status: string;
}
interface BankAccount { id: number; name: string; }
interface Paginated<T> { data: T[]; current_page: number; last_page: number; }

export default function BankTransactionsIndex({
    bankAccount,
    transactions,
    filters,
}: {
    bankAccount: BankAccount;
    transactions: Paginated<Transaction>;
    filters: { status?: string };
}) {
    const [form, setForm] = useState({ transaction_date: '', description: '', reference: '', type: 'credit', amount: '' });
    const [showImport, setShowImport] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/accounting/bank-accounts/${bankAccount.id}/transactions`, form, {
            onSuccess: () => { setShowImport(false); setForm({ transaction_date: '', description: '', reference: '', type: 'credit', amount: '' }); },
        });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <a href="/accounting/bank-accounts" className="text-blue-600 hover:underline text-sm">← Bank Accounts</a>
                <h1 className="text-2xl font-bold text-gray-800">Transactions: {bankAccount.name}</h1>
                <button onClick={() => setShowImport(v => !v)} className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    + Import Transaction
                </button>
                <a href={`/accounting/bank-accounts/${bankAccount.id}/reconcile`} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                    Reconcile
                </a>
            </div>

            {showImport && (
                <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" value={form.transaction_date} onChange={e => setForm(f => ({ ...f, transaction_date: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                        <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex items-end gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Import</button>
                        <button type="button" onClick={() => setShowImport(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200">Cancel</button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Date</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Description</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Reference</th>
                            <th className="px-4 py-3 text-center text-gray-600 font-medium">Type</th>
                            <th className="px-4 py-3 text-right text-gray-600 font-medium">Amount</th>
                            <th className="px-4 py-3 text-center text-gray-600 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.data.map(txn => (
                            <tr key={txn.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-600">{txn.transaction_date}</td>
                                <td className="px-4 py-3">{txn.description ?? '—'}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs font-mono">{txn.reference ?? '—'}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${txn.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {txn.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">${txn.amount.toFixed(2)}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${txn.status === 'reconciled' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {txn.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {transactions.data.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No transactions found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

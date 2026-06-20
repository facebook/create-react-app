import React, { useState } from 'react';
import { router } from '@inertiajs/react';

interface BankAccount {
    id: number;
    name: string;
    bank_name: string;
    account_number: string;
    currency: string;
    current_balance: number;
    is_active: boolean;
    last_reconciled_at: string | null;
}

export default function BankAccountsIndex({ bankAccounts }: { bankAccounts: BankAccount[] }) {
    const [form, setForm] = useState({ name: '', bank_name: '', account_number: '', currency: 'USD' });
    const [showForm, setShowForm] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/accounting/bank-accounts', form, {
            onSuccess: () => { setShowForm(false); setForm({ name: '', bank_name: '', account_number: '', currency: 'USD' }); },
        });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Bank Accounts</h1>
                <button onClick={() => setShowForm(v => !v)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    + Add Bank Account
                </button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                        <input value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <input value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                            maxLength={3} className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div className="col-span-2 flex gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Create</button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200">Cancel</button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Bank</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Account #</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Currency</th>
                            <th className="px-4 py-3 text-right text-gray-600 font-medium">Balance</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Last Reconciled</th>
                            <th className="px-4 py-3 text-center text-gray-600 font-medium">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {bankAccounts.map(ba => (
                            <tr key={ba.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{ba.name}</td>
                                <td className="px-4 py-3 text-gray-600">{ba.bank_name}</td>
                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{ba.account_number}</td>
                                <td className="px-4 py-3">{ba.currency}</td>
                                <td className="px-4 py-3 text-right font-medium">{ba.current_balance.toFixed(2)}</td>
                                <td className="px-4 py-3 text-gray-500">{ba.last_reconciled_at ?? '—'}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${ba.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {ba.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 flex gap-2">
                                    <a href={`/accounting/bank-accounts/${ba.id}/reconcile`} className="text-blue-600 hover:underline text-xs">Reconcile</a>
                                    <a href={`/accounting/bank-accounts/${ba.id}/transactions`} className="text-gray-600 hover:underline text-xs">Txns</a>
                                    <a href={`/accounting/bank-accounts/${ba.id}/rules`} className="text-gray-600 hover:underline text-xs">Rules</a>
                                </td>
                            </tr>
                        ))}
                        {bankAccounts.length === 0 && (
                            <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No bank accounts configured.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

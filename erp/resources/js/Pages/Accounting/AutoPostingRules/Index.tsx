import React, { useState } from 'react';
import { router } from '@inertiajs/react';

interface Rule {
    id: number;
    name: string;
    match_keyword: string | null;
    match_type: string;
    is_active: boolean;
    debit_account: { id: number; name: string; code: string };
    credit_account: { id: number; name: string; code: string };
}
interface Account { id: number; name: string; code: string; }
interface BankAccount { id: number; name: string; }

export default function AutoPostingRulesIndex({
    bankAccount,
    rules,
    accounts,
}: {
    bankAccount: BankAccount;
    rules: Rule[];
    accounts: Account[];
}) {
    const [form, setForm] = useState({ name: '', match_keyword: '', match_type: 'description', debit_account_id: '', credit_account_id: '' });
    const [showForm, setShowForm] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/accounting/bank-accounts/${bankAccount.id}/rules`, form, {
            onSuccess: () => { setShowForm(false); setForm({ name: '', match_keyword: '', match_type: 'description', debit_account_id: '', credit_account_id: '' }); },
        });
    };

    const destroy = (ruleId: number) => {
        if (!confirm('Delete this rule?')) return;
        router.delete(`/accounting/bank-accounts/${bankAccount.id}/rules/${ruleId}`);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <a href="/accounting/bank-accounts" className="text-blue-600 hover:underline text-sm">← Bank Accounts</a>
                <h1 className="text-2xl font-bold text-gray-800">Auto-Posting Rules: {bankAccount.name}</h1>
                <button onClick={() => setShowForm(v => !v)} className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    + Add Rule
                </button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Match Type</label>
                        <select value={form.match_type} onChange={e => setForm(f => ({ ...f, match_type: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="description">Description</option>
                            <option value="reference">Reference</option>
                            <option value="amount">Amount</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Match Keyword</label>
                        <input value={form.match_keyword} onChange={e => setForm(f => ({ ...f, match_keyword: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Debit Account</label>
                        <select value={form.debit_account_id} onChange={e => setForm(f => ({ ...f, debit_account_id: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                            <option value="">Select account</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Credit Account</label>
                        <select value={form.credit_account_id} onChange={e => setForm(f => ({ ...f, credit_account_id: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                            <option value="">Select account</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Create Rule</button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200">Cancel</button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Rule Name</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Match</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Debit</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Credit</th>
                            <th className="px-4 py-3 text-center text-gray-600 font-medium">Active</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.map(rule => (
                            <tr key={rule.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{rule.name}</td>
                                <td className="px-4 py-3 text-gray-600 text-xs">
                                    {rule.match_type}: <code className="bg-gray-100 px-1 rounded">{rule.match_keyword ?? 'any'}</code>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{rule.debit_account?.name}</td>
                                <td className="px-4 py-3 text-gray-600">{rule.credit_account?.name}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block w-2 h-2 rounded-full ${rule.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => destroy(rule.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {rules.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No rules yet. Add one to auto-reconcile transactions.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

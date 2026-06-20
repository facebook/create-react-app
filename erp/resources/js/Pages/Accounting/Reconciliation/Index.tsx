import React from 'react';
import axios from 'axios';

interface Transaction {
    id: number;
    transaction_date: string;
    reference: string | null;
    description: string | null;
    type: 'debit' | 'credit';
    amount: number;
    status: string;
}
interface BankAccount { id: number; name: string; bank_name: string; current_balance: number; }

export default function ReconciliationIndex({
    bankAccount,
    transactions,
    reconciledBalance,
}: {
    bankAccount: BankAccount;
    transactions: Transaction[];
    reconciledBalance: number;
}) {
    const handleReconcile = (txnId: number) => {
        axios.post(`/accounting/bank-accounts/${bankAccount.id}/transactions/${txnId}/reconcile`)
            .then(() => window.location.reload())
            .catch(() => alert('Failed to reconcile'));
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <a href="/accounting/bank-accounts" className="text-blue-600 hover:underline text-sm">← Bank Accounts</a>
                <h1 className="text-2xl font-bold text-gray-800">Reconcile: {bankAccount.name}</h1>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Bank Balance</div>
                    <div className="text-2xl font-bold text-gray-800">${bankAccount.current_balance.toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Reconciled Balance</div>
                    <div className="text-2xl font-bold text-green-700">${reconciledBalance.toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Unreconciled Items</div>
                    <div className="text-2xl font-bold text-amber-600">{transactions.length}</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-4 py-3 border-b font-medium text-gray-700">Unreconciled Transactions</div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Date</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Description</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Reference</th>
                            <th className="px-4 py-3 text-center text-gray-600 font-medium">Type</th>
                            <th className="px-4 py-3 text-right text-gray-600 font-medium">Amount</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(txn => (
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
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleReconcile(txn.id)}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                                    >
                                        Reconcile
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-green-600 font-medium">All transactions reconciled!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PettyCashFund, PettyCashTransaction } from '@/types/finance';

interface Props {
    fund: PettyCashFund;
    transactions: PettyCashTransaction[];
}

export default function Show({ fund, transactions }: Props) {
    const replenishForm = useForm({ amount: '' });
    const expenseForm = useForm({
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().slice(0, 10),
        category: '',
    });

    function submitReplenish(e: React.FormEvent) {
        e.preventDefault();
        replenishForm.post(`/finance/petty-cash/${fund.id}/replenish`, {
            onSuccess: () => replenishForm.reset(),
        });
    }

    function submitExpense(e: React.FormEvent) {
        e.preventDefault();
        expenseForm.post(`/finance/petty-cash/${fund.id}/expense`, {
            onSuccess: () => expenseForm.reset(),
        });
    }

    return (
        <AppLayout>
            <Head title={fund.name} />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">{fund.name}</h1>
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                            fund.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                        {fund.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* Fund Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Authorized</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">
                            {fund.currency} {fund.authorized_amount.toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Current Balance</p>
                        <p className={`mt-1 text-2xl font-semibold ${fund.is_low_balance ? 'text-red-600' : 'text-slate-900'}`}>
                            {fund.currency} {fund.current_balance.toFixed(2)}
                        </p>
                        {fund.is_low_balance && (
                            <p className="mt-1 text-xs text-red-500">Low balance warning</p>
                        )}
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Utilization</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{fund.utilization_percent}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Replenish Form */}
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <h2 className="mb-4 text-base font-semibold text-slate-900">Replenish Fund</h2>
                        <form onSubmit={submitReplenish} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={replenishForm.data.amount}
                                    onChange={(e) => replenishForm.setData('amount', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {replenishForm.errors.amount && (
                                    <p className="mt-1 text-xs text-red-500">{replenishForm.errors.amount}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={replenishForm.processing}
                                className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                Replenish
                            </button>
                        </form>
                    </div>

                    {/* Expense Form */}
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <h2 className="mb-4 text-base font-semibold text-slate-900">Record Expense</h2>
                        <form onSubmit={submitExpense} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={expenseForm.data.amount}
                                    onChange={(e) => expenseForm.setData('amount', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Description</label>
                                <input
                                    type="text"
                                    value={expenseForm.data.description}
                                    onChange={(e) => expenseForm.setData('description', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Date</label>
                                <input
                                    type="date"
                                    value={expenseForm.data.transaction_date}
                                    onChange={(e) => expenseForm.setData('transaction_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={expenseForm.processing}
                                className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                Record Expense
                            </button>
                        </form>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="rounded-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <h2 className="text-base font-semibold text-slate-900">Recent Transactions</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-600">{tx.transaction_date}</td>
                                    <td className="px-4 py-3 text-sm capitalize text-slate-600">{tx.type}</td>
                                    <td className="px-4 py-3 text-sm text-slate-900">{tx.description}</td>
                                    <td className={`px-4 py-3 text-right text-sm font-medium ${tx.is_debit ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.is_debit ? '-' : '+'}{tx.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No transactions yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

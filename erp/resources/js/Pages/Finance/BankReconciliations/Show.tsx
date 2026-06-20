import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { BankReconciliation, BankTransactionV2 } from '@/types/finance';

interface Props extends PageProps {
    reconciliation: BankReconciliation;
    transactions: BankTransactionV2[];
}

export default function BankReconciliationsShow({ reconciliation, transactions }: Props) {
    const { can } = usePermission();

    function handleComplete() {
        router.post(`/finance/bank-reconciliations/${reconciliation.id}/complete`, {}, { preserveScroll: true });
    }

    function toggleReconcile(txId: number) {
        router.patch(`/finance/bank-transactions/${txId}/reconcile`, {}, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="Reconciliation Details" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Bank Reconciliation</h1>
                        <p className="text-sm text-slate-500 mt-1">{reconciliation.account?.name} — {reconciliation.statement_date}</p>
                    </div>
                    {reconciliation.status === 'draft' && can('finance.create') && (
                        <Button onClick={handleComplete}>Complete Reconciliation</Button>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4">
                        <p className="text-sm text-slate-500">Statement Balance</p>
                        <p className="text-xl font-semibold text-slate-900 mt-1">{Number(reconciliation.statement_balance).toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4">
                        <p className="text-sm text-slate-500">Reconciled Balance</p>
                        <p className="text-xl font-semibold text-slate-900 mt-1">{Number(reconciliation.reconciled_balance).toFixed(2)}</p>
                    </div>
                    <div className={`rounded-lg border shadow-sm p-4 ${reconciliation.is_balanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <p className="text-sm text-slate-500">Difference</p>
                        <p className={`text-xl font-semibold mt-1 ${reconciliation.is_balanced ? 'text-green-700' : 'text-red-700'}`}>
                            {Number(reconciliation.difference).toFixed(2)}
                            {reconciliation.is_balanced && <span className="ml-2 text-sm">Balanced</span>}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-medium text-slate-900">Transactions</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Reconciled</th>
                                {reconciliation.status === 'draft' && can('finance.create') && (
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No transactions for this account.
                                    </td>
                                </tr>
                            )}
                            {transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-600">{tx.transaction_date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900">{tx.description}</td>
                                    <td className={`px-6 py-4 text-sm text-right font-mono ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tx.is_reconciled ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {tx.is_reconciled ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    {reconciliation.status === 'draft' && can('finance.create') && (
                                        <td className="px-6 py-4 text-right text-sm">
                                            <button
                                                onClick={() => toggleReconcile(tx.id)}
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                {tx.is_reconciled ? 'Unmark' : 'Mark Reconciled'}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

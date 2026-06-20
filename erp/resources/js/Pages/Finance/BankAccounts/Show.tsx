import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { BankAccount, BankTransaction } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    account: BankAccount;
    transactions: Paginator<BankTransaction>;
    balance: number;
    unreconciled: number;
}

export default function BankAccountShow({ account, transactions, balance, unreconciled }: Props) {
    const { can } = usePermission();
    const [showImport, setShowImport] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm<{ file: File | null }>({ file: null });

    function handleImport(e: React.FormEvent) {
        e.preventDefault();
        post(`/finance/bank-accounts/${account.id}/import`, {
            forceFormData: true,
            onSuccess: () => { setShowImport(false); reset(); },
        });
    }

    function handleUnmatch(txnId: number) {
        router.post(`/finance/reconciliation/${txnId}/unmatch`, {}, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title={account.name} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link href="/finance/bank-accounts" className="text-sm text-slate-500 hover:text-slate-700">Bank Accounts</Link>
                            <span className="text-slate-400">/</span>
                            <h1 className="text-2xl font-semibold text-slate-900">{account.name}</h1>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {can('finance.create') && (
                            <Button variant="secondary" onClick={() => setShowImport(!showImport)}>
                                {showImport ? 'Cancel Import' : 'Import CSV'}
                            </Button>
                        )}
                        {can('finance.create') && (
                            <Link href={`/finance/bank-accounts/${account.id}/edit`}>
                                <Button variant="secondary">Edit</Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Account Details Card */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Bank</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{account.bank_name ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Account Number</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{account.account_number ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Currency</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{account.currency_code}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Current Balance</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">
                                {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            {unreconciled > 0 && (
                                <Link href={`/finance/reconciliation?account_id=${account.id}`}>
                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 hover:bg-amber-200">
                                        {unreconciled} unreconciled
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* CSV Import Form */}
                {showImport && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Import Bank Statement (CSV)</h2>
                        <p className="text-sm text-slate-500 mb-4">
                            CSV format: <code className="bg-slate-100 px-1 rounded">date, description, amount, reference</code> (header row required, reference optional)
                        </p>
                        <form onSubmit={handleImport} encType="multipart/form-data" className="flex items-center gap-3">
                            <input
                                type="file"
                                accept=".csv,.txt"
                                onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                className="block text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            <Button type="submit" disabled={processing || !data.file}>
                                {processing ? 'Importing...' : 'Import'}
                            </Button>
                        </form>
                        {errors.file && <p className="mt-2 text-xs text-red-600">{errors.file}</p>}
                    </div>
                )}

                {/* Transactions Table */}
                <div>
                    <h2 className="text-base font-semibold text-slate-900 mb-3">Transactions</h2>
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reference</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                                            No transactions yet. Import a bank statement to get started.
                                        </td>
                                    </tr>
                                )}
                                {transactions.data.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                            {typeof txn.transaction_date === 'string'
                                                ? txn.transaction_date
                                                : new Date(txn.transaction_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900">{txn.description ?? '-'}</td>
                                        <td className={`px-6 py-4 text-sm font-mono text-right font-medium ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {txn.amount >= 0 ? '+' : ''}{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{txn.reference ?? '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            {txn.reconciled ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                    Reconciled
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                                                    Unreconciled
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm">
                                            {txn.reconciled && can('finance.create') && (
                                                <button
                                                    onClick={() => handleUnmatch(txn.id)}
                                                    className="text-slate-600 hover:text-red-600 text-xs"
                                                >
                                                    Unmatch
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {transactions.last_page > 1 && (
                        <div className="mt-4">
                            <Pagination paginator={transactions} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

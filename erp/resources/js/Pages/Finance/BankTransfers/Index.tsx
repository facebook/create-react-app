import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { BankTransfer } from '@/types/finance';

interface Props {
    transfers: {
        data: BankTransfer[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: { status?: string };
}

export default function Index({ transfers, filters }: Props) {
    return (
        <AppLayout>
            <Head title="Bank Transfers" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Bank Transfers</h1>
                    <Link
                        href="/finance/bank-transfers/create"
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        New Transfer
                    </Link>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">From</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">To</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-6 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transfers.data.map((transfer) => (
                                <tr key={transfer.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-700">{transfer.transfer_date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {(transfer as any).from_account?.name ?? transfer.from_account_id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {(transfer as any).to_account?.name ?? transfer.to_account_id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {transfer.currency} {Number(transfer.amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                            transfer.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            transfer.status === 'failed'    ? 'bg-red-100 text-red-700' :
                                            transfer.status === 'cancelled' ? 'bg-slate-100 text-slate-600' :
                                                                              'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {transfer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm">
                                        <Link
                                            href={`/finance/bank-transfers/${transfer.id}`}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {transfers.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                                        No bank transfers found.
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

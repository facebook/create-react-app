import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { BankTransfer } from '@/types/finance';

interface Props {
    transfer: BankTransfer & {
        from_account?: { id: number; name: string };
        to_account?: { id: number; name: string };
        created_by_user?: { id: number; name: string };
    };
}

export default function Show({ transfer }: Props) {
    const handleAction = (action: 'complete' | 'fail' | 'cancel') => {
        router.post(`/finance/bank-transfers/${transfer.id}/${action}`);
    };

    return (
        <AppLayout>
            <Head title={`Bank Transfer #${transfer.id}`} />
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Bank Transfer #{transfer.id}</h1>
                    <Link
                        href="/finance/bank-transfers"
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        &larr; Back to list
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">From Account</dt>
                            <dd className="mt-1 text-sm text-slate-800">
                                {transfer.from_account?.name ?? transfer.from_account_id}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">To Account</dt>
                            <dd className="mt-1 text-sm text-slate-800">
                                {transfer.to_account?.name ?? transfer.to_account_id}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Amount</dt>
                            <dd className="mt-1 text-sm text-slate-800">
                                {transfer.currency} {Number(transfer.amount).toFixed(2)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Transfer Date</dt>
                            <dd className="mt-1 text-sm text-slate-800">{transfer.transfer_date}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    transfer.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    transfer.status === 'failed'    ? 'bg-red-100 text-red-700' :
                                    transfer.status === 'cancelled' ? 'bg-slate-100 text-slate-600' :
                                                                      'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {transfer.status}
                                </span>
                            </dd>
                        </div>
                        {transfer.reference && (
                            <div>
                                <dt className="text-xs font-medium uppercase text-slate-500">Reference</dt>
                                <dd className="mt-1 text-sm text-slate-800">{transfer.reference}</dd>
                            </div>
                        )}
                    </dl>

                    {transfer.is_pending && (
                        <div className="mt-6 flex gap-3 border-t border-slate-100 pt-6">
                            <button
                                onClick={() => handleAction('complete')}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                            >
                                Mark Complete
                            </button>
                            <button
                                onClick={() => handleAction('fail')}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Mark Failed
                            </button>
                            <button
                                onClick={() => handleAction('cancel')}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

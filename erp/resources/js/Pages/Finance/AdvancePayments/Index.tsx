import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { AdvancePayment } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    advancePayments: Paginator<AdvancePayment>;
}

export default function AdvancePaymentsIndex({ advancePayments }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Advance Payments" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Advance Payments</h1>
                        <p className="text-sm text-slate-500 mt-1">{advancePayments.total} advance payments</p>
                    </div>
                    <div className="flex gap-2">
                        {can('finance.create') && (
                            <Link href="/finance/advance-payments/create"><Button>New Advance Payment</Button></Link>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            { key: 'reference', header: 'Reference', render: (ap) => (
                                <Link href={`/finance/advance-payments/${ap.id}`} className="font-mono text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                    {ap.reference ?? `AP-${ap.id}`}
                                </Link>
                            )},
                            { key: 'contact', header: 'Customer', render: (ap) => (ap as any).contact?.name ?? '—' },
                            { key: 'payment_date', header: 'Payment Date', render: (ap) => ap.payment_date },
                            { key: 'amount', header: 'Amount', render: (ap) => `${ap.currency} ${Number(ap.amount).toFixed(2)}` },
                            { key: 'applied_amount', header: 'Applied', render: (ap) => Number(ap.applied_amount).toFixed(2) },
                            { key: 'remaining_amount', header: 'Remaining', render: (ap) => Number(ap.remaining_amount).toFixed(2) },
                            { key: 'status', header: 'Status', render: (ap) => (
                                <span className="capitalize rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                    {ap.status.replace('_', ' ')}
                                </span>
                            )},
                        ]}
                        data={advancePayments.data}
                        emptyMessage="No advance payments found."
                    />
                    <Pagination paginator={advancePayments} />
                </div>
            </div>
        </AppLayout>
    );
}

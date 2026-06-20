import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { BatchPayment } from '@/types/finance';

interface Props extends PageProps {
    batchPayment: BatchPayment;
}

const typeColors: Record<string, string> = {
    received: 'bg-green-50 text-green-700',
    made: 'bg-orange-50 text-orange-700',
};

const methodLabel: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    cash: 'Cash',
    card: 'Card',
    other: 'Other',
};

export default function BatchPaymentShow({ batchPayment }: Props) {
    function handleDelete() {
        if (confirm('Delete this batch payment? This action cannot be undone.')) {
            router.delete(`/finance/batch-payments/${batchPayment.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Batch Payment — ${batchPayment.reference}`} />
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/finance/batch-payments" className="text-sm text-indigo-600 hover:text-indigo-900">
                            &larr; Batch Payments
                        </Link>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{batchPayment.reference}</h1>
                    </div>
                    <Button onClick={handleDelete} variant="danger">Delete</Button>
                </div>

                {/* Details card */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Batch Details</h2>
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs text-slate-500">Type</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${typeColors[batchPayment.type] ?? 'bg-slate-100 text-slate-600'}`}>
                                    {batchPayment.type}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Payment Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{batchPayment.payment_date}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Payment Method</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {methodLabel[batchPayment.payment_method] ?? batchPayment.payment_method}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Total Amount</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900">
                                {Number(batchPayment.total_amount).toFixed(2)}
                            </dd>
                        </div>
                        {batchPayment.notes && (
                            <div className="col-span-2">
                                <dt className="text-xs text-slate-500">Notes</dt>
                                <dd className="mt-1 text-sm text-slate-900">{batchPayment.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Payments list */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-sm font-medium text-slate-700">
                            Individual Payments ({batchPayment.payments?.length ?? 0})
                        </h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(!batchPayment.payments || batchPayment.payments.length === 0) && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">
                                        No individual payments.
                                    </td>
                                </tr>
                            )}
                            {batchPayment.payments?.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-900">
                                        {payment.invoice
                                            ? (
                                                <Link
                                                    href={`/finance/invoices/${payment.invoice.id}`}
                                                    className="hover:text-indigo-600"
                                                >
                                                    {payment.invoice.number ?? `Invoice #${payment.invoice.id}`}
                                                </Link>
                                            )
                                            : `Record #${payment.id}`
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                                        {Number(payment.amount).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {payment.payment_date}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

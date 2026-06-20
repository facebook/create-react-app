import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { BatchPayment } from '@/types/finance';

interface PaginatedBatches {
    data: BatchPayment[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props extends PageProps {
    batches: PaginatedBatches;
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

export default function BatchPaymentIndex({ batches }: Props) {
    function handleDelete(id: number) {
        if (confirm('Delete this batch payment?')) {
            router.delete(`/finance/batch-payments/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Batch Payments" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Batch Payments</h1>
                    <div className="flex gap-2">
                        <Link href="/finance/batch-payments/create?type=received">
                            <Button variant="secondary">Receive from Customers</Button>
                        </Link>
                        <Link href="/finance/batch-payments/create?type=made">
                            <Button>Pay Suppliers</Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reference</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Method</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total Amount</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"># Payments</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {batches.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No batch payments yet. Create one to get started.
                                    </td>
                                </tr>
                            )}
                            {batches.data.map((batch) => (
                                <tr key={batch.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        <Link href={`/finance/batch-payments/${batch.id}`} className="hover:text-indigo-600">
                                            {batch.reference}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${typeColors[batch.type] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {batch.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{batch.payment_date}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {methodLabel[batch.payment_method] ?? batch.payment_method}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-900 font-medium">
                                        {Number(batch.total_amount).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                                        {batch.payments_count ?? 0}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/finance/batch-payments/${batch.id}`}
                                                className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(batch.id)}
                                                className="text-red-600 hover:text-red-900 text-xs font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {batches.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {batches.prev_page_url && (
                            <Link href={batches.prev_page_url}>
                                <Button variant="secondary">Previous</Button>
                            </Link>
                        )}
                        <span className="px-3 py-2 text-sm text-slate-600">
                            Page {batches.current_page} of {batches.last_page}
                        </span>
                        {batches.next_page_url && (
                            <Link href={batches.next_page_url}>
                                <Button variant="secondary">Next</Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

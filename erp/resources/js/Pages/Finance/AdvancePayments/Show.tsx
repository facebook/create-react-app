import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { AdvancePayment } from '@/types/finance';

interface Props extends PageProps { advancePayment: AdvancePayment; }

export default function AdvancePaymentShow({ advancePayment }: Props) {
    const { can } = usePermission();

    function doRefund() {
        if (!confirm('Refund this advance payment?')) return;
        router.post(`/finance/advance-payments/${advancePayment.id}/refund`);
    }

    function doDelete() {
        if (!confirm('Delete this advance payment?')) return;
        router.delete(`/finance/advance-payments/${advancePayment.id}`);
    }

    return (
        <AppLayout>
            <Head title={advancePayment.reference ?? `Advance Payment #${advancePayment.id}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {advancePayment.reference ?? `Advance Payment #${advancePayment.id}`}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Status: <span className="capitalize font-medium">{advancePayment.status.replace('_', ' ')}</span>
                            &bull; Date: {advancePayment.payment_date}
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                        {can('finance.create') && advancePayment.status !== 'refunded' && (
                            <Button variant="secondary" onClick={doRefund}>Refund</Button>
                        )}
                        {can('finance.delete') && (
                            <Button variant="secondary" onClick={doDelete}>Delete</Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Amount</p>
                        <p className="text-xl font-semibold text-slate-900">{advancePayment.currency} {Number(advancePayment.amount).toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Remaining</p>
                        <p className="text-xl font-semibold text-green-700">{advancePayment.currency} {Number(advancePayment.remaining_amount).toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Applied</p>
                        <p className="font-medium text-slate-900">{Number(advancePayment.applied_amount).toFixed(2)}</p>
                    </div>
                    {(advancePayment as any).contact && (
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500 mb-1">Customer</p>
                            <p className="font-medium text-slate-900">{(advancePayment as any).contact.name}</p>
                        </div>
                    )}
                </div>

                {advancePayment.notes && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{advancePayment.notes}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { PaymentTerm } from '@/types/finance';

interface Props extends PageProps {
    paymentTerm: PaymentTerm;
}

export default function PaymentTermShow({ paymentTerm }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (!confirm('Delete this payment term?')) return;
        router.delete(`/finance/payment-terms/${paymentTerm.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Payment Term: ${paymentTerm.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{paymentTerm.name}</h1>
                        <p className="mt-1 text-sm text-slate-500">{paymentTerm.display_label}</p>
                    </div>
                    {can('finance.delete') && (
                        <button
                            onClick={handleDelete}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Delete
                        </button>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Net Days</dt>
                            <dd className="mt-1 text-sm text-slate-900">{paymentTerm.days}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${paymentTerm.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                    {paymentTerm.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </dd>
                        </div>
                        {paymentTerm.has_early_discount && (
                            <>
                                <div>
                                    <dt className="text-sm font-medium text-slate-500">Discount Days</dt>
                                    <dd className="mt-1 text-sm text-slate-900">{paymentTerm.discount_days}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-500">Discount Percent</dt>
                                    <dd className="mt-1 text-sm text-slate-900">{paymentTerm.discount_percent}%</dd>
                                </div>
                            </>
                        )}
                        {paymentTerm.description && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Description</dt>
                                <dd className="mt-1 text-sm text-slate-900">{paymentTerm.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { PaymentTerm } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    paymentTerms: Paginator<PaymentTerm>;
}

export default function PaymentTermsIndex({ paymentTerms }: Props) {
    const { can } = usePermission();

    function handleDelete(id: number) {
        if (!confirm('Delete this payment term?')) return;
        router.delete(`/finance/payment-terms/${id}`);
    }

    return (
        <AppLayout>
            <Head title="Payment Terms" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Payment Terms</h1>
                        <p className="mt-1 text-sm text-slate-500">{paymentTerms.total} payment terms</p>
                    </div>
                    {can('finance.create') && (
                        <Button onClick={() => router.post('/finance/payment-terms', {
                            name: 'Net 30', days: 30, discount_days: 0, discount_percent: 0, is_active: true,
                        })}>
                            New Payment Term
                        </Button>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'name',
                                header: 'Name',
                                render: (pt) => pt.name,
                            },
                            {
                                key: 'display_label',
                                header: 'Label',
                                render: (pt) => pt.display_label,
                            },
                            {
                                key: 'days',
                                header: 'Net Days',
                                render: (pt) => pt.days,
                            },
                            {
                                key: 'discount',
                                header: 'Early Discount',
                                render: (pt) => pt.has_early_discount
                                    ? `${pt.discount_percent}% in ${pt.discount_days} days`
                                    : '—',
                            },
                            {
                                key: 'is_active',
                                header: 'Status',
                                render: (pt) => (
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pt.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                        {pt.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (pt) => (
                                    <div className="flex items-center gap-3">
                                        <Link href={`/finance/payment-terms/${pt.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                            View
                                        </Link>
                                        {can('finance.delete') && (
                                            <button
                                                onClick={() => handleDelete(pt.id)}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={paymentTerms.data}
                        emptyMessage="No payment terms found."
                    />
                    <Pagination paginator={paymentTerms} />
                </div>
            </div>
        </AppLayout>
    );
}

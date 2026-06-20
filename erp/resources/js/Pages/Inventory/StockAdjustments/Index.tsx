import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { StockAdjustment, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    adjustments: Paginator<StockAdjustment>;
}

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function StockAdjustmentsIndex({ adjustments }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Stock Adjustments" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Stock Adjustments</h1>
                        <p className="text-sm text-slate-500 mt-1">{adjustments.total} adjustments</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/stock-adjustments/create">
                            <Button>New Adjustment</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'reference',
                                header: 'Reference',
                                render: (a) => (
                                    <span className="font-mono text-xs text-slate-700">{a.reference}</span>
                                ),
                            },
                            {
                                key: 'warehouse',
                                header: 'Warehouse',
                                render: (a) => a.warehouse?.name ?? '—',
                            },
                            {
                                key: 'reason',
                                header: 'Reason',
                                render: (a) => (
                                    <span className="capitalize">{a.reason}</span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (a) => (
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge[a.status] ?? ''}`}>
                                        {a.status}
                                    </span>
                                ),
                            },
                            {
                                key: 'adjuster',
                                header: 'Adjusted By',
                                render: (a) => a.adjuster?.name ?? '—',
                            },
                            {
                                key: 'created_at',
                                header: 'Date',
                                render: (a) => new Date(a.created_at).toLocaleDateString(),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (a) => (
                                    <Link
                                        href={`/inventory/stock-adjustments/${a.id}`}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                    >
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={adjustments.data}
                        emptyMessage="No stock adjustments found."
                    />
                    <Pagination paginator={adjustments} />
                </div>
            </div>
        </AppLayout>
    );
}

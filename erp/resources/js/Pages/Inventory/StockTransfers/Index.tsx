import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { StockTransfer, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    transfers: Paginator<StockTransfer>;
}

const statusBadge: Record<string, string> = {
    draft:      'bg-slate-100 text-slate-700',
    in_transit: 'bg-blue-100 text-blue-700',
    completed:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
};

export default function StockTransfersIndex({ transfers }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Stock Transfers" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Stock Transfers</h1>
                        <p className="text-sm text-slate-500 mt-1">{transfers.total} transfers</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/stock-transfers/create">
                            <Button>New Transfer</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'reference',
                                header: 'Reference',
                                render: (t) => (
                                    <span className="font-mono text-xs text-slate-700">
                                        {t.reference ?? `#${t.id}`}
                                    </span>
                                ),
                            },
                            {
                                key: 'route',
                                header: 'Route',
                                render: (t) => (
                                    <span className="text-sm text-slate-700">
                                        {t.from_warehouse?.name ?? '—'} &rarr; {t.to_warehouse?.name ?? '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (t) => (
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge[t.status] ?? ''}`}>
                                        {t.status.replace('_', ' ')}
                                    </span>
                                ),
                            },
                            {
                                key: 'items_count',
                                header: 'Items',
                                render: (t) => t.items_count ?? 0,
                            },
                            {
                                key: 'transferred_at',
                                header: 'Transferred At',
                                render: (t) =>
                                    t.transferred_at
                                        ? new Date(t.transferred_at).toLocaleString()
                                        : '—',
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (t) => (
                                    <Link
                                        href={`/inventory/stock-transfers/${t.id}`}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                    >
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={transfers.data}
                        emptyMessage="No stock transfers found."
                    />
                    <Pagination paginator={transfers} />
                </div>
            </div>
        </AppLayout>
    );
}

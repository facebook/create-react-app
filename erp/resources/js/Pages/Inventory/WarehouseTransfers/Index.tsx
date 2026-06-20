import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { WarehouseTransfer, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    transfers: Paginator<WarehouseTransfer>;
}

export default function WarehouseTransfersIndex({ transfers }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Warehouse Transfers" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Warehouse Transfers</h1>
                        <p className="text-sm text-slate-500 mt-1">{transfers.total} transfers</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/warehouse-transfers/create">
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
                                    <span className="font-mono text-xs text-slate-700">{t.reference ?? '—'}</span>
                                ),
                            },
                            {
                                key: 'product',
                                header: 'Product',
                                render: (t) => (
                                    <span className="font-medium text-slate-900">{t.product?.name ?? '—'}</span>
                                ),
                            },
                            {
                                key: 'from_warehouse',
                                header: 'From Warehouse',
                                render: (t) => t.from_warehouse?.name ?? '—',
                            },
                            {
                                key: 'to_warehouse',
                                header: 'To Warehouse',
                                render: (t) => t.to_warehouse?.name ?? '—',
                            },
                            {
                                key: 'quantity',
                                header: 'Quantity',
                                render: (t) => Number(t.quantity).toLocaleString(),
                            },
                            {
                                key: 'created_at',
                                header: 'Date',
                                render: (t) => new Date(t.created_at).toLocaleDateString(),
                            },
                        ]}
                        data={transfers.data}
                        emptyMessage="No warehouse transfers found."
                    />
                    <Pagination paginator={transfers} />
                </div>
            </div>
        </AppLayout>
    );
}

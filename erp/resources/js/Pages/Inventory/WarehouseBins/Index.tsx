import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { WarehouseBin, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    bins: Paginator<WarehouseBin>;
    filters: { warehouse_id?: string };
}

const binTypeColors: Record<string, string> = {
    standard: 'bg-slate-100 text-slate-600',
    cold:     'bg-blue-100 text-blue-700',
    hazmat:   'bg-red-100 text-red-700',
    oversize: 'bg-amber-100 text-amber-700',
};

export default function WarehouseBinsIndex({ bins, filters }: Props) {
    const { can } = usePermission();

    function handleWarehouseFilter(e: React.ChangeEvent<HTMLInputElement>) {
        router.get('/inventory/warehouse-bins', { warehouse_id: e.target.value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Bin Locations" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Bin Locations</h1>
                        <p className="text-sm text-slate-500 mt-1">{bins.total} bins total</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/warehouse-bins/create">
                            <Button>New Bin</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <input
                            type="text"
                            placeholder="Filter by warehouse ID..."
                            value={filters.warehouse_id ?? ''}
                            onChange={handleWarehouseFilter}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <Table
                        columns={[
                            { key: 'code', header: 'Code', render: (b) => (
                                <span className="font-mono font-medium text-slate-900">{b.code}</span>
                            )},
                            { key: 'name', header: 'Name', render: (b) => b.name ?? <span className="text-slate-400">—</span> },
                            { key: 'bin_type', header: 'Type', render: (b) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${binTypeColors[b.bin_type] ?? ''}`}>
                                    {b.bin_type}
                                </span>
                            )},
                            { key: 'zone', header: 'Zone', render: (b) => b.zone?.name ?? <span className="text-slate-400">—</span> },
                            { key: 'warehouse', header: 'Warehouse', render: (b) => b.warehouse?.name ?? <span className="text-slate-400">—</span> },
                            { key: 'capacity', header: 'Capacity / Used', render: (b) => (
                                <span className="text-sm text-slate-600">
                                    {b.capacity != null ? `${b.used_capacity} / ${b.capacity}` : <span className="text-slate-400">—</span>}
                                </span>
                            )},
                            { key: 'is_active', header: 'Active', render: (b) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {b.is_active ? 'Yes' : 'No'}
                                </span>
                            )},
                            { key: 'actions', header: '', render: (b) => (
                                <Link href={`/inventory/warehouse-bins/${b.id}`} className="text-xs text-indigo-600 hover:text-indigo-800">
                                    View
                                </Link>
                            )},
                        ]}
                        data={bins.data}
                        emptyMessage="No bins found."
                    />
                    <Pagination paginator={bins} />
                </div>
            </div>
        </AppLayout>
    );
}

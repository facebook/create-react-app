import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Warehouse } from '@/types/inventory';

interface Props extends PageProps {
    warehouses: Warehouse[];
}

export default function WarehousesIndex({ warehouses }: Props) {
    const { can } = usePermission();

    function handleDelete(id: number, name: string) {
        if (!confirm(`Delete warehouse "${name}"?`)) return;
        router.delete(`/inventory/warehouses/${id}`);
    }

    return (
        <AppLayout>
            <Head title="Warehouses" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Warehouses</h1>
                        <p className="text-sm text-slate-500 mt-1">{warehouses.length} warehouses</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/warehouses/create">
                            <Button>Add Warehouse</Button>
                        </Link>
                    )}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            { key: 'name', header: 'Name', render: (w) => <span className="font-medium text-slate-900">{w.name}</span> },
                            { key: 'location', header: 'Location', render: (w) => w.location ?? '—' },
                            { key: 'stock_levels_count', header: 'Products', render: (w) => w.stock_levels_count ?? 0 },
                            { key: 'status', header: 'Status', render: (w) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${w.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {w.is_active ? 'Active' : 'Inactive'}
                                </span>
                            )},
                            { key: 'actions', header: '', render: (w) => (
                                <div className="flex gap-3">
                                    {can('inventory.update') && (
                                        <Link href={`/inventory/warehouses/${w.id}/edit`} className="text-sm text-indigo-600 hover:text-indigo-800">Edit</Link>
                                    )}
                                    {can('inventory.delete') && (
                                        <button onClick={() => handleDelete(w.id, w.name)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                                    )}
                                </div>
                            )},
                        ]}
                        data={warehouses}
                        emptyMessage="No warehouses found."
                    />
                </div>
            </div>
        </AppLayout>
    );
}

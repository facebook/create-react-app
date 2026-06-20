import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { WarehouseZone, Warehouse, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    zones: Paginator<WarehouseZone>;
    filters: { warehouse_id?: string };
    warehouses: Warehouse[];
}

export default function WarehouseZonesIndex({ zones, filters, warehouses }: Props) {
    const { can } = usePermission();

    const addForm = useForm({
        warehouse_id: '',
        name: '',
        code: '',
    });

    function handleAddZone(e: React.FormEvent) {
        e.preventDefault();
        addForm.post('/inventory/warehouse-zones', {
            preserveScroll: true,
            onSuccess: () => addForm.reset(),
        });
    }

    function handleDelete(zone: WarehouseZone) {
        if (!confirm(`Delete zone "${zone.name}"?`)) return;
        router.delete(`/inventory/warehouse-zones/${zone.id}`, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="Warehouse Zones" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Warehouse Zones</h1>
                        <p className="text-sm text-slate-500 mt-1">{zones.total} zones total</p>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            { key: 'code', header: 'Code', render: (z) => (
                                <span className="font-mono font-medium text-slate-900">{z.code}</span>
                            )},
                            { key: 'name', header: 'Name', render: (z) => z.name },
                            { key: 'warehouse', header: 'Warehouse', render: (z) => z.warehouse?.name ?? '—' },
                            { key: 'bins_count', header: 'Bins', render: (z) => z.bins_count ?? 0 },
                            { key: 'is_active', header: 'Active', render: (z) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${z.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {z.is_active ? 'Yes' : 'No'}
                                </span>
                            )},
                            { key: 'actions', header: '', render: (z) => can('inventory.delete') ? (
                                <button
                                    onClick={() => handleDelete(z)}
                                    className="text-xs text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            ) : null },
                        ]}
                        data={zones.data}
                        emptyMessage="No zones found."
                    />
                    <Pagination paginator={zones} />
                </div>

                {/* Add Zone Form */}
                {can('inventory.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Add Zone</h2>
                        <form onSubmit={handleAddZone} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse <span className="text-red-500">*</span></label>
                                <select
                                    value={addForm.data.warehouse_id}
                                    onChange={(e) => addForm.setData('warehouse_id', e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="">Select warehouse…</option>
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                                {addForm.errors.warehouse_id && <p className="mt-1 text-xs text-red-600">{addForm.errors.warehouse_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {addForm.errors.name && <p className="mt-1 text-xs text-red-600">{addForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    maxLength={20}
                                    value={addForm.data.code}
                                    onChange={(e) => addForm.setData('code', e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {addForm.errors.code && <p className="mt-1 text-xs text-red-600">{addForm.errors.code}</p>}
                            </div>
                            <div className="sm:col-span-3 flex justify-end">
                                <Button type="submit" disabled={addForm.processing}>
                                    {addForm.processing ? 'Adding…' : 'Add Zone'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

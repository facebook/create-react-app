import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { WarehouseStock, Warehouse, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    stocks: Paginator<WarehouseStock>;
    warehouse_id?: string | null;
    warehouses?: Warehouse[];
}

export default function WarehouseStockIndex({ stocks, warehouse_id, warehouses }: Props) {
    const { can } = usePermission();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [reorderValue, setReorderValue] = useState<string>('');

    function handleFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
        router.get('/inventory/warehouse-stock', { warehouse_id: e.target.value || undefined }, { preserveState: true });
    }

    function startEdit(stock: WarehouseStock) {
        setEditingId(stock.id);
        setReorderValue(stock.reorder_point != null ? String(stock.reorder_point) : '');
    }

    function cancelEdit() {
        setEditingId(null);
        setReorderValue('');
    }

    function saveReorderPoint(stock: WarehouseStock) {
        router.patch(
            `/inventory/warehouse-stock/${stock.id}`,
            { reorder_point: reorderValue === '' ? null : reorderValue },
            {
                preserveState: false,
                onSuccess: () => {
                    setEditingId(null);
                },
            }
        );
    }

    return (
        <AppLayout>
            <Head title="Warehouse Stock" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Warehouse Stock</h1>
                        <p className="text-sm text-slate-500 mt-1">{stocks.total} stock entries</p>
                    </div>
                    {warehouses && warehouses.length > 0 && (
                        <select
                            value={warehouse_id ?? ''}
                            onChange={handleFilterChange}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'product',
                                header: 'Product',
                                render: (s) => (
                                    <span className="font-medium text-slate-900">
                                        {s.product?.name ?? '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'sku',
                                header: 'SKU',
                                render: (s) => (
                                    <span className="font-mono text-xs text-slate-500">
                                        {s.product?.sku ?? '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'warehouse',
                                header: 'Warehouse',
                                render: (s) => s.warehouse?.name ?? '—',
                            },
                            {
                                key: 'quantity',
                                header: 'Quantity',
                                render: (s) => (
                                    <span className="font-mono text-sm">
                                        {Number(s.quantity).toFixed(4)}
                                    </span>
                                ),
                            },
                            {
                                key: 'reorder_point',
                                header: 'Reorder Point',
                                render: (s) => {
                                    if (editingId === s.id) {
                                        return (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.0001"
                                                    value={reorderValue}
                                                    onChange={(e) => setReorderValue(e.target.value)}
                                                    className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => saveReorderPoint(s)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="text-xs text-slate-500 hover:text-slate-700"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm">
                                                {s.reorder_point != null ? Number(s.reorder_point).toFixed(4) : '—'}
                                            </span>
                                            {can('inventory.create') && (
                                                <button
                                                    onClick={() => startEdit(s)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    );
                                },
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (s) =>
                                    s.is_below_reorder_point ? (
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                            Low Stock
                                        </span>
                                    ) : null,
                            },
                        ]}
                        data={stocks.data}
                        emptyMessage="No stock entries found."
                    />
                    <Pagination paginator={stocks} />
                </div>
            </div>
        </AppLayout>
    );
}

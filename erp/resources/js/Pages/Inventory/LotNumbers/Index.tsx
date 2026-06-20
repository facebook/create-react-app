import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { LotNumber, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    lots: Paginator<LotNumber>;
    products: { id: number; name: string; sku: string }[];
    warehouses: { id: number; name: string }[];
    filters: { product_id?: string; warehouse_id?: string; status?: string };
}

const statusColors: Record<string, string> = {
    active:     'bg-green-100 text-green-700',
    quarantine: 'bg-amber-100 text-amber-700',
    consumed:   'bg-slate-100 text-slate-500',
    expired:    'bg-red-100 text-red-600',
};

export default function LotNumbersIndex({ lots, products, warehouses, filters }: Props) {
    const { can } = usePermission();

    const { data, setData, post, processing, reset, errors } = useForm({
        product_id:        '',
        warehouse_id:      '',
        lot_number:        '',
        manufacture_date:  '',
        expiry_date:       '',
        quantity_received: '',
    });

    function handleFilter(key: string, value: string) {
        router.get('/inventory/lot-numbers', { ...filters, [key]: value || undefined }, {
            preserveState: true, replace: true,
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/lot-numbers', { onSuccess: () => reset() });
    }

    return (
        <AppLayout>
            <Head title="Lot Numbers" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Lot Numbers</h1>
                        <p className="text-sm text-slate-500 mt-1">{lots.total} lots total</p>
                    </div>
                </div>

                {can('inventory.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4">
                        <h2 className="text-base font-medium text-slate-800 mb-3">Add Lot</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Product</label>
                                <select
                                    value={data.product_id}
                                    onChange={(e) => setData('product_id', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select product...</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                    ))}
                                </select>
                                {errors.product_id && <p className="text-xs text-red-600 mt-1">{errors.product_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Warehouse</label>
                                <select
                                    value={data.warehouse_id}
                                    onChange={(e) => setData('warehouse_id', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select warehouse...</option>
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                                {errors.warehouse_id && <p className="text-xs text-red-600 mt-1">{errors.warehouse_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Lot Number</label>
                                <input
                                    type="text"
                                    value={data.lot_number}
                                    onChange={(e) => setData('lot_number', e.target.value)}
                                    placeholder="e.g. LOT-2026-001"
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                                {errors.lot_number && <p className="text-xs text-red-600 mt-1">{errors.lot_number}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Manufacture Date</label>
                                <input
                                    type="date"
                                    value={data.manufacture_date}
                                    onChange={(e) => setData('manufacture_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    value={data.expiry_date}
                                    onChange={(e) => setData('expiry_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Quantity Received</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.quantity_received}
                                    onChange={(e) => setData('quantity_received', e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                                {errors.quantity_received && <p className="text-xs text-red-600 mt-1">{errors.quantity_received}</p>}
                            </div>
                            <div className="col-span-2 md:col-span-3 flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Add Lot'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3 flex gap-3">
                        <select
                            value={filters.product_id ?? ''}
                            onChange={(e) => handleFilter('product_id', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Products</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <select
                            value={filters.warehouse_id ?? ''}
                            onChange={(e) => handleFilter('warehouse_id', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                        <select
                            value={filters.status ?? ''}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="quarantine">Quarantine</option>
                            <option value="consumed">Consumed</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'lot_number', header: 'Lot Number', render: (l) => (
                                <div>
                                    <a href={`/inventory/lot-numbers/${l.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                        {l.lot_number}
                                    </a>
                                    {l.is_expiring && (
                                        <span className="ml-2 text-xs font-medium text-amber-600">Expiring soon</span>
                                    )}
                                </div>
                            )},
                            { key: 'product', header: 'Product', render: (l) => l.product?.name ?? '—' },
                            { key: 'warehouse', header: 'Warehouse', render: (l) => l.warehouse?.name ?? '—' },
                            { key: 'manufacture_date', header: 'Mfg Date', render: (l) => l.manufacture_date ?? <span className="text-slate-400">—</span> },
                            { key: 'expiry_date', header: 'Expiry Date', render: (l) => l.expiry_date
                                ? <span className={l.is_expiring ? 'text-amber-600 font-medium' : l.is_expired ? 'text-red-600 font-medium' : ''}>{l.expiry_date}</span>
                                : <span className="text-slate-400">—</span>
                            },
                            { key: 'quantity_received', header: 'Qty Received', render: (l) => l.quantity_received },
                            { key: 'quantity_remaining', header: 'Qty Remaining', render: (l) => (
                                <span className={l.quantity_remaining === 0 ? 'text-slate-400' : 'font-medium'}>
                                    {l.quantity_remaining}
                                </span>
                            )},
                            { key: 'status', header: 'Status', render: (l) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[l.status] ?? ''}`}>
                                    {l.status}
                                </span>
                            )},
                        ]}
                        data={lots.data}
                        rowClassName={(l) => l.is_expiring ? 'bg-amber-50' : ''}
                        emptyMessage="No lot numbers found."
                    />
                    <Pagination paginator={lots} />
                </div>
            </div>
        </AppLayout>
    );
}

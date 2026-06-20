import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { SerialNumber, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    serials: Paginator<SerialNumber>;
    products: { id: number; name: string; sku: string }[];
    warehouses: { id: number; name: string }[];
    filters: { product_id?: string; status?: string };
}

const statusColors: Record<string, string> = {
    in_stock:  'bg-green-100 text-green-700',
    sold:      'bg-blue-100 text-blue-700',
    returned:  'bg-amber-100 text-amber-700',
    scrapped:  'bg-red-100 text-red-600',
};

export default function SerialNumbersIndex({ serials, products, warehouses, filters }: Props) {
    const { can } = usePermission();

    const { data, setData, post, processing, reset, errors } = useForm({
        product_id:    '',
        warehouse_id:  '',
        serial_number: '',
        received_date: new Date().toISOString().split('T')[0],
        lot_number_id: '',
    });

    function handleFilter(key: string, value: string) {
        router.get('/inventory/serial-numbers', { ...filters, [key]: value || undefined }, {
            preserveState: true, replace: true,
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/serial-numbers', { onSuccess: () => reset() });
    }

    return (
        <AppLayout>
            <Head title="Serial Numbers" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Serial Numbers</h1>
                        <p className="text-sm text-slate-500 mt-1">{serials.total} serial numbers total</p>
                    </div>
                </div>

                {can('inventory.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4">
                        <h2 className="text-base font-medium text-slate-800 mb-3">Add Serial Number</h2>
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
                                <label className="block text-xs font-medium text-slate-600 mb-1">Serial Number</label>
                                <input
                                    type="text"
                                    value={data.serial_number}
                                    onChange={(e) => setData('serial_number', e.target.value)}
                                    placeholder="e.g. SN-2026-001"
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                                {errors.serial_number && <p className="text-xs text-red-600 mt-1">{errors.serial_number}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Received Date</label>
                                <input
                                    type="date"
                                    value={data.received_date}
                                    onChange={(e) => setData('received_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Lot Number ID (optional)</label>
                                <input
                                    type="number"
                                    value={data.lot_number_id}
                                    onChange={(e) => setData('lot_number_id', e.target.value)}
                                    placeholder="Lot ID..."
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-3 flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Add Serial Number'}
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
                            value={filters.status ?? ''}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="in_stock">In Stock</option>
                            <option value="sold">Sold</option>
                            <option value="returned">Returned</option>
                            <option value="scrapped">Scrapped</option>
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'serial_number', header: 'Serial Number', render: (s) => (
                                <a href={`/inventory/serial-numbers/${s.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                    {s.serial_number}
                                </a>
                            )},
                            { key: 'product', header: 'Product', render: (s) => s.product?.name ?? '—' },
                            { key: 'warehouse', header: 'Warehouse', render: (s) => s.warehouse?.name ?? '—' },
                            { key: 'status', header: 'Status', render: (s) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s.status] ?? ''}`}>
                                    {s.status.replace('_', ' ')}
                                </span>
                            )},
                            { key: 'received_date', header: 'Received', render: (s) => s.received_date ?? <span className="text-slate-400">—</span> },
                            { key: 'sold_date', header: 'Sold', render: (s) => s.sold_date ?? <span className="text-slate-400">—</span> },
                        ]}
                        data={serials.data}
                        emptyMessage="No serial numbers found."
                    />
                    <Pagination paginator={serials} />
                </div>
            </div>
        </AppLayout>
    );
}

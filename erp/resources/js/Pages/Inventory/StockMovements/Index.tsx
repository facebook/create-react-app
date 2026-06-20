import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { StockMovement, Paginator, Product, Warehouse } from '@/types/inventory';

interface StockMovementFormData {
    product_id: string;
    warehouse_id: string;
    type: string;
    quantity: string;
    reference: string;
    notes: string;
    [key: string]: string;
}

interface Props extends PageProps {
    movements: Paginator<StockMovement>;
    products: Product[];
    warehouses: Warehouse[];
    filters: { product_id?: string; type?: string };
}

const typeColors: Record<string, string> = {
    in:         'bg-green-100 text-green-700',
    out:        'bg-red-100 text-red-700',
    transfer:   'bg-blue-100 text-blue-700',
    adjustment: 'bg-amber-100 text-amber-700',
};

export default function StockMovementsIndex({ movements, products, warehouses, filters }: Props) {
    const { can } = usePermission();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<StockMovementFormData>({
        product_id: '', warehouse_id: '', type: 'in', quantity: '', reference: '', notes: '',
    });
    const [submitting, setSubmitting] = useState(false);

    function handleFilter(key: string, value: string) {
        router.get('/inventory/stock-movements', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post('/inventory/stock-movements', form, {
            onSuccess: () => { setShowForm(false); setForm({ product_id: '', warehouse_id: '', type: 'in', quantity: '', reference: '', notes: '' }); },
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AppLayout>
            <Head title="Stock Movements" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Stock Movements</h1>
                        <p className="text-sm text-slate-500 mt-1">{movements.total} movements</p>
                    </div>
                    {can('inventory.create') && (
                        <Button onClick={() => setShowForm(!showForm)}>Record Movement</Button>
                    )}
                </div>

                {showForm && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Record Stock Movement</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product *</label>
                                <select value={form.product_id} onChange={(e) => setForm(f => ({...f, product_id: e.target.value}))} required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="">Select product</option>
                                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse *</label>
                                <select value={form.warehouse_id} onChange={(e) => setForm(f => ({...f, warehouse_id: e.target.value}))} required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="">Select warehouse</option>
                                    {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                                <select value={form.type} onChange={(e) => setForm(f => ({...f, type: e.target.value}))} required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="in">In</option>
                                    <option value="out">Out</option>
                                    <option value="adjustment">Adjustment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
                                <input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => setForm(f => ({...f, quantity: e.target.value}))} required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                                <input type="text" value={form.reference} onChange={(e) => setForm(f => ({...f, reference: e.target.value}))}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                <input type="text" value={form.notes} onChange={(e) => setForm(f => ({...f, notes: e.target.value}))}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="sm:col-span-3 flex gap-3 border-t border-slate-200 pt-4">
                                <Button type="submit" loading={submitting}>Record</Button>
                                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3 flex gap-3">
                        <select value={filters.product_id ?? ''} onChange={(e) => handleFilter('product_id', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="">All products</option>
                            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <select value={filters.type ?? ''} onChange={(e) => handleFilter('type', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="">All types</option>
                            <option value="in">In</option>
                            <option value="out">Out</option>
                            <option value="adjustment">Adjustment</option>
                            <option value="transfer">Transfer</option>
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'product', header: 'Product', render: (m) => (
                                <span className="font-medium text-slate-900">{m.product?.name ?? '—'}</span>
                            )},
                            { key: 'sku', header: 'SKU', render: (m) => (
                                <span className="font-mono text-xs text-slate-500">{m.product?.sku ?? '—'}</span>
                            )},
                            { key: 'warehouse', header: 'Warehouse', render: (m) => m.warehouse?.name ?? '—' },
                            { key: 'type', header: 'Type', render: (m) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[m.type] ?? 'bg-slate-100 text-slate-700'}`}>
                                    {m.type}
                                </span>
                            )},
                            { key: 'quantity', header: 'Qty', render: (m) => Number(m.quantity).toLocaleString() },
                            { key: 'reference', header: 'Reference', render: (m) => m.reference ?? '—' },
                            { key: 'creator', header: 'By', render: (m) => m.creator?.name ?? '—' },
                            { key: 'created_at', header: 'Date', render: (m) => new Date(m.created_at).toLocaleDateString() },
                        ]}
                        data={movements.data}
                        emptyMessage="No stock movements found."
                    />
                    <Pagination paginator={movements} />
                </div>
            </div>
        </AppLayout>
    );
}

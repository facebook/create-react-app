import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface Warehouse {
    id: number;
    name: string;
}

interface Supplier {
    id: number;
    name: string;
}

interface Props extends PageProps {
    products: Product[];
    warehouses: Warehouse[];
    suppliers: Supplier[];
}

export default function ReplenishmentsCreate({ products, warehouses, suppliers }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        product_id:     '',
        warehouse_id:   '',
        qty_needed:     '',
        qty_to_order:   '',
        route:          'buy',
        scheduled_date: '',
        supplier_id:    '',
        notes:          '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/replenishments');
    }

    return (
        <AppLayout>
            <Head title="New Replenishment Order" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">New Replenishment Order</h1>
                    <Link href="/inventory/replenishments" className="text-sm text-blue-600 hover:underline">
                        Back to list
                    </Link>
                </div>
                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Product *</label>
                        <select
                            value={data.product_id}
                            onChange={(e) => setData('product_id', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">— Select Product —</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </select>
                        {errors.product_id && <p className="mt-1 text-xs text-red-600">{errors.product_id}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Warehouse *</label>
                        <select
                            value={data.warehouse_id}
                            onChange={(e) => setData('warehouse_id', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">— Select Warehouse —</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                        {errors.warehouse_id && <p className="mt-1 text-xs text-red-600">{errors.warehouse_id}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Qty Needed *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.qty_needed}
                                onChange={(e) => setData('qty_needed', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                            {errors.qty_needed && <p className="mt-1 text-xs text-red-600">{errors.qty_needed}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Qty to Order *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.qty_to_order}
                                onChange={(e) => setData('qty_to_order', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                            {errors.qty_to_order && <p className="mt-1 text-xs text-red-600">{errors.qty_to_order}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Route *</label>
                        <select
                            value={data.route}
                            onChange={(e) => setData('route', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="buy">Purchase Order</option>
                            <option value="manufacture">Manufacturing Order</option>
                            <option value="resupply">Internal Transfer</option>
                        </select>
                        {errors.route && <p className="mt-1 text-xs text-red-600">{errors.route}</p>}
                    </div>
                    {data.route === 'buy' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Supplier</label>
                            <select
                                value={data.supplier_id}
                                onChange={(e) => setData('supplier_id', e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">— Select Supplier —</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Scheduled Date</label>
                        <input
                            type="date"
                            value={data.scheduled_date}
                            onChange={(e) => setData('scheduled_date', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Link
                            href="/inventory/replenishments"
                            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Create Order
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

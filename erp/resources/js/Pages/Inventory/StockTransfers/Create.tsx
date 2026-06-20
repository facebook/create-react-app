import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Warehouse, Product } from '@/types/inventory';

interface Props extends PageProps {
    warehouses: Warehouse[];
    products: Product[];
}

interface ItemRow {
    product_id: string;
    quantity: string;
}

export default function StockTransferCreate({ warehouses, products }: Props) {
    const { errors } = usePage<Props>().props;
    const errorsMap = (errors ?? {}) as Record<string, string>;

    const [from_warehouse_id, setFromWarehouseId] = useState('');
    const [to_warehouse_id, setToWarehouseId] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<ItemRow[]>([{ product_id: '', quantity: '' }]);
    const [submitting, setSubmitting] = useState(false);

    function addItem() {
        setItems((prev) => [...prev, { product_id: '', quantity: '' }]);
    }

    function removeItem(index: number) {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }

    function updateItem(index: number, field: keyof ItemRow, value: string) {
        setItems((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            '/inventory/stock-transfers',
            { from_warehouse_id, to_warehouse_id, notes, items },
            { onFinish: () => setSubmitting(false) }
        );
    }

    return (
        <AppLayout>
            <Head title="New Stock Transfer" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Stock Transfer</h1>
                    <p className="text-sm text-slate-500 mt-1">Move stock between warehouses</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm max-w-2xl space-y-5">
                        {/* From Warehouse */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                From Warehouse <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={from_warehouse_id}
                                onChange={(e) => setFromWarehouseId(e.target.value)}
                                required
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">Select source warehouse</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                            {errorsMap.from_warehouse_id && (
                                <p className="mt-1 text-sm text-red-600">{errorsMap.from_warehouse_id}</p>
                            )}
                        </div>

                        {/* To Warehouse */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                To Warehouse <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={to_warehouse_id}
                                onChange={(e) => setToWarehouseId(e.target.value)}
                                required
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">Select destination warehouse</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                            {errorsMap.to_warehouse_id && (
                                <p className="mt-1 text-sm text-red-600">{errorsMap.to_warehouse_id}</p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Items */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <h2 className="text-base font-medium text-slate-900">Products to Transfer</h2>
                            <Button type="button" variant="secondary" onClick={addItem}>
                                Add Product
                            </Button>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Product</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Quantity</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-2">
                                            <select
                                                value={row.product_id}
                                                onChange={(e) => updateItem(i, 'product_id', e.target.value)}
                                                required
                                                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="">Select product</option>
                                                {products.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.sku} — {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                min="0.0001"
                                                step="0.0001"
                                                value={row.quantity}
                                                onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                                                required
                                                placeholder="0.0000"
                                                className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(i)}
                                                    className="text-red-500 hover:text-red-700 text-xs"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {errorsMap.items && (
                            <p className="px-6 py-2 text-sm text-red-600">{errorsMap.items}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" loading={submitting}>
                            Create Transfer
                        </Button>
                        <a href="/inventory/stock-transfers">
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

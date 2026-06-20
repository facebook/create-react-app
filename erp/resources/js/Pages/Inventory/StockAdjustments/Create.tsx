import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Product, Warehouse } from '@/types/inventory';

interface Props extends PageProps {
    warehouses: Warehouse[];
    products: Product[];
}

interface ItemRow {
    product_id: string;
    expected_quantity: string;
    actual_quantity: string;
}

const REASONS = ['count', 'damage', 'theft', 'expiry', 'correction', 'other'] as const;

export default function StockAdjustmentCreate({ warehouses, products }: Props) {
    const { errors } = usePage<Props>().props;
    const errorsMap = (errors ?? {}) as Record<string, string>;

    const [warehouse_id, setWarehouseId] = useState('');
    const [reference, setReference] = useState('');
    const [reason, setReason] = useState<string>('count');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<ItemRow[]>([
        { product_id: '', expected_quantity: '', actual_quantity: '' },
    ]);
    const [submitting, setSubmitting] = useState(false);

    function addItem() {
        setItems((prev) => [...prev, { product_id: '', expected_quantity: '', actual_quantity: '' }]);
    }

    function removeItem(index: number) {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }

    function updateItem(index: number, field: keyof ItemRow, value: string) {
        setItems((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    }

    function getDifference(row: ItemRow): string {
        const expected = parseFloat(row.expected_quantity);
        const actual = parseFloat(row.actual_quantity);
        if (isNaN(expected) || isNaN(actual)) return '—';
        const diff = actual - expected;
        return diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            '/inventory/stock-adjustments',
            { warehouse_id, reference, reason, notes, items },
            { onFinish: () => setSubmitting(false) }
        );
    }

    return (
        <AppLayout>
            <Head title="New Stock Adjustment" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Stock Adjustment</h1>
                    <p className="text-sm text-slate-500 mt-1">Create a stock count correction</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm max-w-2xl space-y-5">
                        {/* Warehouse */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Warehouse <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={warehouse_id}
                                onChange={(e) => setWarehouseId(e.target.value)}
                                required
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">Select warehouse</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                            {errorsMap.warehouse_id && (
                                <p className="mt-1 text-sm text-red-600">{errorsMap.warehouse_id}</p>
                            )}
                        </div>

                        {/* Reference */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Reference <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                required
                                maxLength={100}
                                placeholder="e.g. ADJ-001"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errorsMap.reference && (
                                <p className="mt-1 text-sm text-red-600">{errorsMap.reference}</p>
                            )}
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Reason <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                {REASONS.map((r) => (
                                    <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                ))}
                            </select>
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
                            <h2 className="text-base font-medium text-slate-900">Products</h2>
                            <Button type="button" variant="secondary" onClick={addItem}>
                                Add Product
                            </Button>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Product</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Expected Qty</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Actual Qty</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Difference</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((row, i) => {
                                    const diff = getDifference(row);
                                    const diffNum = parseFloat(diff);
                                    const diffClass = isNaN(diffNum) ? '' : diffNum > 0 ? 'text-green-600' : diffNum < 0 ? 'text-red-600' : 'text-slate-600';
                                    return (
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
                                                    min="0"
                                                    step="0.01"
                                                    value={row.expected_quantity}
                                                    onChange={(e) => updateItem(i, 'expected_quantity', e.target.value)}
                                                    required
                                                    className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={row.actual_quantity}
                                                    onChange={(e) => updateItem(i, 'actual_quantity', e.target.value)}
                                                    required
                                                    className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className={`px-4 py-2 font-mono text-sm font-medium ${diffClass}`}>
                                                {diff}
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
                                    );
                                })}
                            </tbody>
                        </table>
                        {errorsMap.items && (
                            <p className="px-6 py-2 text-sm text-red-600">{errorsMap.items}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" loading={submitting}>
                            Create Adjustment
                        </Button>
                        <a href="/inventory/stock-adjustments">
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

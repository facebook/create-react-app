import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Product } from '@/types/inventory';

interface Props extends PageProps {
    products: Product[];
}

interface ItemRow {
    product_id: string;
    description: string;
    quantity: string;
    estimated_unit_cost: string;
}

export default function PurchaseRequisitionCreate({ products }: Props) {
    const { errors } = usePage<Props>().props;
    const errorsMap = (errors ?? {}) as Record<string, string>;

    const [reference, setReference] = useState('');
    const [needed_by, setNeededBy] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<ItemRow[]>([
        { product_id: '', description: '', quantity: '1', estimated_unit_cost: '0' },
    ]);
    const [submitting, setSubmitting] = useState(false);

    function addItem() {
        setItems((prev) => [
            ...prev,
            { product_id: '', description: '', quantity: '1', estimated_unit_cost: '0' },
        ]);
    }

    function removeItem(index: number) {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }

    function updateItem(index: number, field: keyof ItemRow, value: string) {
        setItems((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    }

    function handleProductChange(index: number, productId: string) {
        const product = products.find((p) => String(p.id) === productId);
        setItems((prev) =>
            prev.map((row, i) =>
                i === index
                    ? {
                          ...row,
                          product_id: productId,
                          estimated_unit_cost: product ? String(product.cost_price) : row.estimated_unit_cost,
                      }
                    : row
            )
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            '/inventory/purchase-requisitions',
            { reference, needed_by: needed_by || null, notes, items },
            { onFinish: () => setSubmitting(false) }
        );
    }

    return (
        <AppLayout>
            <Head title="New Purchase Requisition" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Purchase Requisition</h1>
                    <p className="text-sm text-slate-500 mt-1">Request approval to purchase goods or services</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm max-w-2xl space-y-5">
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
                                placeholder="e.g. PR-001"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errorsMap.reference && (
                                <p className="mt-1 text-sm text-red-600">{errorsMap.reference}</p>
                            )}
                        </div>

                        {/* Needed By */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Needed By
                            </label>
                            <input
                                type="date"
                                value={needed_by}
                                onChange={(e) => setNeededBy(e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errorsMap.needed_by && (
                                <p className="mt-1 text-sm text-red-600">{errorsMap.needed_by}</p>
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

                    {/* Line Items */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <h2 className="text-base font-medium text-slate-900">Line Items</h2>
                            <Button type="button" variant="secondary" onClick={addItem}>
                                Add Item
                            </Button>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Product (optional)</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Description <span className="text-red-500">*</span></th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Qty</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Est. Unit Cost</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Line Total</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((row, i) => {
                                    const lineTotal = (parseFloat(row.quantity) || 0) * (parseFloat(row.estimated_unit_cost) || 0);
                                    return (
                                        <tr key={i}>
                                            <td className="px-4 py-2">
                                                <select
                                                    value={row.product_id}
                                                    onChange={(e) => handleProductChange(i, e.target.value)}
                                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                >
                                                    <option value="">— None —</option>
                                                    {products.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.sku} — {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={row.description}
                                                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                                                    required
                                                    placeholder="Description"
                                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={row.quantity}
                                                    onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                                                    required
                                                    className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={row.estimated_unit_cost}
                                                    onChange={(e) => updateItem(i, 'estimated_unit_cost', e.target.value)}
                                                    required
                                                    className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-slate-700 font-mono text-sm">
                                                {lineTotal.toFixed(2)}
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
                            Create Requisition
                        </Button>
                        <a href="/inventory/purchase-requisitions">
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

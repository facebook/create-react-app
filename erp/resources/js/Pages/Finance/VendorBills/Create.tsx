import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Supplier {
    id: number;
    name: string;
}

interface BillItem {
    description: string;
    quantity: number;
    unit_price: number;
}

interface Props extends PageProps {
    suppliers: Supplier[];
}

export default function VendorBillCreate({ suppliers }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        supplier_id: string;
        bill_date: string;
        due_date: string;
        currency: string;
        notes: string;
        items: BillItem[];
    }>({
        supplier_id: '',
        bill_date: new Date().toISOString().split('T')[0],
        due_date: '',
        currency: 'USD',
        notes: '',
        items: [{ description: '', quantity: 1, unit_price: 0 }],
    });

    const [itemErrors, setItemErrors] = useState<Record<string, string>[]>([]);

    function addItem() {
        setData('items', [...data.items, { description: '', quantity: 1, unit_price: 0 }]);
    }

    function removeItem(idx: number) {
        setData('items', data.items.filter((_, i) => i !== idx));
    }

    function updateItem(idx: number, field: keyof BillItem, value: string | number) {
        const updated = data.items.map((item, i) =>
            i === idx ? { ...item, [field]: value } : item,
        );
        setData('items', updated);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/vendor-bills');
    }

    const inputClass =
        'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

    const lineTotal = (item: BillItem) => (item.quantity * item.unit_price).toFixed(2);
    const grandTotal = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

    return (
        <AppLayout>
            <Head title="Create Vendor Bill" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">
                            <Link href="/finance/vendor-bills" className="text-indigo-600 hover:underline">
                                Vendor Bills
                            </Link>{' '}
                            &rsaquo; New Bill
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Create Vendor Bill</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bill details */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-sm font-semibold text-slate-700">Bill Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Supplier</label>
                                <select
                                    value={data.supplier_id}
                                    onChange={(e) => setData('supplier_id', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">— Select Supplier —</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.supplier_id && (
                                    <p className="mt-1 text-xs text-red-600">{errors.supplier_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Currency</label>
                                <input
                                    type="text"
                                    maxLength={3}
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value.toUpperCase())}
                                    className={inputClass}
                                    placeholder="USD"
                                />
                                {errors.currency && (
                                    <p className="mt-1 text-xs text-red-600">{errors.currency}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Bill Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.bill_date}
                                    onChange={(e) => setData('bill_date', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                {errors.bill_date && (
                                    <p className="mt-1 text-xs text-red-600">{errors.bill_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Due Date</label>
                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                    className={inputClass}
                                />
                                {errors.due_date && (
                                    <p className="mt-1 text-xs text-red-600">{errors.due_date}</p>
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Notes</label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className={inputClass}
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Line items */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-700">Line Items</h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                                + Add Line
                            </button>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Description</th>
                                    <th className="px-4 py-2 text-right font-medium w-24">Qty</th>
                                    <th className="px-4 py-2 text-right font-medium w-32">Unit Price</th>
                                    <th className="px-4 py-2 text-right font-medium w-32">Line Total</th>
                                    <th className="px-4 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                                placeholder="Description"
                                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                required
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                required
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))}
                                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                required
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium text-slate-900">
                                            ${lineTotal(item)}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            {data.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(idx)}
                                                    className="text-red-400 hover:text-red-600 text-xs"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right font-semibold text-slate-700">
                                        Total
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                                        ${grandTotal.toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                        {errors.items && <p className="px-4 pb-3 text-xs text-red-600">{errors.items}</p>}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Bill'}
                        </Button>
                        <Link href="/finance/vendor-bills">
                            <Button variant="secondary" type="button">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

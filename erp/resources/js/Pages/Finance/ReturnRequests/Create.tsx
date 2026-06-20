import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Contact, Invoice } from '@/types/finance';

interface Props extends PageProps {
    contacts: Pick<Contact, 'id' | 'name'>[];
    invoices: Pick<Invoice, 'id' | 'number'>[];
}

interface ItemRow {
    product_name: string;
    quantity: number | '';
    unit_price: number | '';
    reason: string;
}

export default function ReturnRequestCreate({ contacts, invoices }: Props) {
    const [form, setForm] = useState({
        contact_id:    '' as number | '',
        invoice_id:    '' as number | '',
        reason:        '',
        refund_amount: '' as number | '',
        notes:         '',
    });
    const [items, setItems] = useState<ItemRow[]>([
        { product_name: '', quantity: 1, unit_price: '' as number | '', reason: '' },
    ]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function addItem() {
        setItems([...items, { product_name: '', quantity: 1, unit_price: '' as number | '', reason: '' }]);
    }

    function removeItem(index: number) {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== index));
    }

    function updateItem(index: number, field: keyof ItemRow, value: string | number) {
        setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/finance/return-requests', {
            ...form,
            items,
        }, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    function fieldClass(name: string) {
        return `mt-1 block w-full rounded-md border ${errors[name] ? 'border-red-500' : 'border-slate-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none`;
    }

    return (
        <AppLayout>
            <Head title="New Return Request" />
            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Return Request</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900">Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Contact</label>
                                <select
                                    value={form.contact_id}
                                    onChange={(e) => setForm({ ...form, contact_id: e.target.value ? Number(e.target.value) : '' })}
                                    className={fieldClass('contact_id')}
                                >
                                    <option value="">No contact</option>
                                    {contacts.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.contact_id && <p className="mt-1 text-xs text-red-600">{errors.contact_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Invoice (optional)</label>
                                <select
                                    value={form.invoice_id}
                                    onChange={(e) => setForm({ ...form, invoice_id: e.target.value ? Number(e.target.value) : '' })}
                                    className={fieldClass('invoice_id')}
                                >
                                    <option value="">No invoice</option>
                                    {invoices.map((inv) => (
                                        <option key={inv.id} value={inv.id}>#{inv.number}</option>
                                    ))}
                                </select>
                                {errors.invoice_id && <p className="mt-1 text-xs text-red-600">{errors.invoice_id}</p>}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Reason *</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={form.reason}
                                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                    className={fieldClass('reason')}
                                />
                                {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Refund Amount *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={form.refund_amount}
                                    onChange={(e) => setForm({ ...form, refund_amount: e.target.value ? Number(e.target.value) : '' })}
                                    className={fieldClass('refund_amount')}
                                />
                                {errors.refund_amount && <p className="mt-1 text-xs text-red-600">{errors.refund_amount}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Notes</label>
                                <textarea
                                    rows={2}
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className={fieldClass('notes')}
                                />
                                {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-900">Items</h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="rounded-md border border-indigo-300 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                            >
                                + Add Item
                            </button>
                        </div>
                        {errors.items && <p className="text-xs text-red-600">{errors.items}</p>}

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-start border border-slate-100 rounded-md p-3">
                                    <div className="col-span-4">
                                        <label className="block text-xs font-medium text-slate-600">Product Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={item.product_name}
                                            onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                                            className={`mt-1 block w-full rounded-md border ${errors[`items.${index}.product_name`] ? 'border-red-500' : 'border-slate-300'} px-2 py-1.5 text-sm focus:outline-none`}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-600">Qty *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value ? Number(e.target.value) : '')}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-600">Unit Price *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            required
                                            value={item.unit_price}
                                            onChange={(e) => updateItem(index, 'unit_price', e.target.value ? Number(e.target.value) : '')}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-xs font-medium text-slate-600">Reason</label>
                                        <input
                                            type="text"
                                            value={item.reason}
                                            onChange={(e) => updateItem(index, 'reason', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none"
                                        />
                                    </div>
                                    <div className="col-span-1 flex items-end justify-center pb-1">
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="text-red-500 hover:text-red-700 text-lg font-bold"
                                                title="Remove item"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href="/finance/return-requests" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </a>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Create Return Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

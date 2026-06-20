import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Contact } from '@/types/finance';

interface Props extends PageProps {
    contacts: Pick<Contact, 'id' | 'name'>[];
    currencies?: string[];
}

interface LineItem {
    description: string;
    quantity: string;
    unit_price: string;
    tax_rate: string;
}

export default function BillCreate({ contacts, currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD'] }: Props) {
    const [form, setForm] = useState({
        contact_id: '' as number | '',
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: '',
        notes: '',
        currency_code: 'USD',
        exchange_rate: '1',
    });
    const [items, setItems] = useState<LineItem[]>([
        { description: '', quantity: '1', unit_price: '', tax_rate: '0' },
    ]);
    const [processing, setProcessing] = useState(false);

    function updateItem(i: number, field: keyof LineItem, value: string) {
        const next = [...items];
        next[i] = { ...next[i], [field]: value };
        setItems(next);
    }

    function addItem() {
        setItems([...items, { description: '', quantity: '1', unit_price: '', tax_rate: '0' }]);
    }

    function removeItem(i: number) {
        if (items.length <= 1) return;
        setItems(items.filter((_, idx) => idx !== i));
    }

    function lineTotal(item: LineItem) {
        const sub = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        const tax = sub * ((parseFloat(item.tax_rate) || 0) / 100);
        return sub + tax;
    }

    const grandTotal = items.reduce((s, i) => s + lineTotal(i), 0);

    function handleCurrencyChange(code: string) {
        setForm({ ...form, currency_code: code, exchange_rate: code === 'USD' ? '1' : form.exchange_rate });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/finance/bills', {
            ...form,
            contact_id:    form.contact_id || null,
            exchange_rate: parseFloat(form.exchange_rate) || 1,
            items: items.map((i) => ({
                description: i.description,
                quantity:    parseFloat(i.quantity) || 0,
                unit_price:  parseFloat(i.unit_price) || 0,
                tax_rate:    parseFloat(i.tax_rate) || 0,
            })),
        } as any, { onFinish: () => setProcessing(false) });
    }

    return (
        <AppLayout>
            <Head title="New Bill" />
            <div className="mx-auto max-w-4xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Bill</h1>
                <form onSubmit={submit} className="space-y-6">
                    {/* Header */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Vendor (Bill From)</label>
                                <select value={form.contact_id}
                                    onChange={(e) => setForm({ ...form, contact_id: e.target.value ? Number(e.target.value) : '' })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                    <option value="">No vendor</option>
                                    {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date <span className="text-red-500">*</span></label>
                                <input type="date" value={form.issue_date}
                                    onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                <input type="date" value={form.due_date}
                                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                                <select value={form.currency_code}
                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                    {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {form.currency_code !== 'USD' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Exchange Rate (USD per 1 {form.currency_code})</label>
                                    <input type="number" min="0.000001" step="0.000001" value={form.exchange_rate}
                                        onChange={(e) => setForm({ ...form, exchange_rate: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                                </div>
                            )}
                            <div className="sm:col-span-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Line items */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
                            <h2 className="text-sm font-medium text-slate-700">Line Items</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Description</th>
                                    <th className="px-4 py-2 text-right font-medium w-20">Qty</th>
                                    <th className="px-4 py-2 text-right font-medium w-28">Unit Price</th>
                                    <th className="px-4 py-2 text-right font-medium w-20">Tax %</th>
                                    <th className="px-4 py-2 text-right font-medium w-28">Total</th>
                                    <th className="px-2 py-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-2">
                                            <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)}
                                                placeholder="Description…"
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input type="number" min="0.01" step="0.01" value={item.quantity}
                                                onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-indigo-500 focus:outline-none" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input type="number" min="0" step="0.01" value={item.unit_price}
                                                onChange={(e) => updateItem(i, 'unit_price', e.target.value)}
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-indigo-500 focus:outline-none" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input type="number" min="0" max="100" step="0.1" value={item.tax_rate}
                                                onChange={(e) => updateItem(i, 'tax_rate', e.target.value)}
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-indigo-500 focus:outline-none" />
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium">{lineTotal(item).toFixed(2)}</td>
                                        <td className="px-2 py-2">
                                            <button type="button" onClick={() => removeItem(i)}
                                                disabled={items.length <= 1}
                                                className="text-slate-400 hover:text-red-500 disabled:opacity-30">✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                                <tr>
                                    <td colSpan={4} className="px-4 py-2">
                                        <button type="button" onClick={addItem}
                                            className="text-sm text-indigo-600 hover:text-indigo-800">+ Add item</button>
                                    </td>
                                    <td className="px-4 py-2 text-right font-semibold text-slate-900">
                                        Total: {grandTotal.toFixed(2)} {form.currency_code}
                                    </td>
                                    <td></td>
                                </tr>
                                {form.currency_code !== 'USD' && (
                                    <tr>
                                        <td colSpan={4}></td>
                                        <td className="px-4 py-1 text-right text-xs text-slate-500">
                                            ≈ {(grandTotal * (parseFloat(form.exchange_rate) || 1)).toFixed(2)} USD
                                        </td>
                                        <td></td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => history.back()}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Create Bill</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

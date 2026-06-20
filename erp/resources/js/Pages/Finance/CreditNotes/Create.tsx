import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Contact } from '@/types/finance';

interface InvoiceOption { id: number; number?: string | null; }
interface BillOption    { id: number; number?: string | null; }

interface Props extends PageProps {
    contacts: Pick<Contact, 'id' | 'name' | 'type'>[];
    invoices: InvoiceOption[];
    bills:    BillOption[];
    type:     'sale' | 'purchase';
}

interface LineItem {
    description: string;
    quantity: string;
    unit_price: string;
    tax_rate: string;
}

export default function CreditNoteCreate({ contacts, invoices, bills, type: initialType }: Props) {
    const [form, setForm] = useState({
        reference:           '',
        type:                initialType as 'sale' | 'purchase',
        contact_id:          '' as number | '',
        original_invoice_id: '' as number | '',
        original_bill_id:    '' as number | '',
        issue_date:          new Date().toISOString().slice(0, 10),
        currency_code:       'USD',
        exchange_rate:       '1',
        notes:               '',
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
        return (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
    }

    const subtotal   = items.reduce((s, i) => s + lineTotal(i), 0);
    const taxTotal   = items.reduce((s, i) => {
        const sub = lineTotal(i);
        return s + sub * ((parseFloat(i.tax_rate) || 0) / 100);
    }, 0);
    const grandTotal = subtotal + taxTotal;

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/finance/credit-notes', {
            ...form,
            contact_id:          form.contact_id          || null,
            original_invoice_id: form.original_invoice_id || null,
            original_bill_id:    form.original_bill_id    || null,
            exchange_rate:       parseFloat(form.exchange_rate) || 1,
            items: items.map((i) => ({
                description: i.description,
                quantity:    parseFloat(i.quantity)   || 0,
                unit_price:  parseFloat(i.unit_price) || 0,
                tax_rate:    parseFloat(i.tax_rate)   || 0,
            })),
        } as any, { onFinish: () => setProcessing(false) });
    }

    return (
        <AppLayout>
            <Head title="New Credit Note" />
            <div className="mx-auto max-w-4xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Credit Note</h1>
                <form onSubmit={submit} className="space-y-6">
                    {/* Header fields */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reference <span className="text-red-500">*</span></label>
                                <input type="text" value={form.reference}
                                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                                    placeholder="CN-2026-001"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type <span className="text-red-500">*</span></label>
                                <select value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value as 'sale' | 'purchase', original_invoice_id: '', original_bill_id: '' })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                    <option value="sale">Sale</option>
                                    <option value="purchase">Purchase</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date <span className="text-red-500">*</span></label>
                                <input type="date" value={form.issue_date}
                                    onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                                <select value={form.contact_id}
                                    onChange={(e) => setForm({ ...form, contact_id: e.target.value ? Number(e.target.value) : '' })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                    <option value="">No contact</option>
                                    {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            {form.type === 'sale' && (
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Original Invoice</label>
                                    <select value={form.original_invoice_id}
                                        onChange={(e) => setForm({ ...form, original_invoice_id: e.target.value ? Number(e.target.value) : '' })}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                        <option value="">None</option>
                                        {invoices.map((inv) => (
                                            <option key={inv.id} value={inv.id}>{inv.number ?? `#${inv.id}`}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {form.type === 'purchase' && (
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Original Bill</label>
                                    <select value={form.original_bill_id}
                                        onChange={(e) => setForm({ ...form, original_bill_id: e.target.value ? Number(e.target.value) : '' })}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                        <option value="">None</option>
                                        {bills.map((b) => (
                                            <option key={b.id} value={b.id}>{b.number ?? `#${b.id}`}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Currency <span className="text-red-500">*</span></label>
                                <input type="text" value={form.currency_code} maxLength={3}
                                    onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Exchange Rate <span className="text-red-500">*</span></label>
                                <input type="number" step="0.000001" min="0.000001" value={form.exchange_rate}
                                    onChange={(e) => setForm({ ...form, exchange_rate: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
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
                                    <th className="px-4 py-2 text-right font-medium w-28">Line Total</th>
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
                                                className="text-slate-400 hover:text-red-500 disabled:opacity-30">x</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                                <tr>
                                    <td colSpan={4} className="px-4 py-2">
                                        <button type="button" onClick={addItem}
                                            className="text-sm text-indigo-600 hover:text-indigo-800">+ Add Line</button>
                                    </td>
                                    <td className="px-4 py-2 text-right text-slate-500 text-sm">Subtotal</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={4}></td>
                                    <td className="px-4 py-1 text-right text-slate-500 text-sm">{subtotal.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="px-4 py-1 text-right text-slate-500 text-sm">Tax</td>
                                    <td className="px-4 py-1 text-right text-slate-500 text-sm">{taxTotal.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                                <tr className="border-t border-slate-200">
                                    <td colSpan={4} className="px-4 py-2 text-right font-semibold text-slate-900">Total</td>
                                    <td className="px-4 py-2 text-right font-semibold text-slate-900">{grandTotal.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => history.back()}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Create Credit Note</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

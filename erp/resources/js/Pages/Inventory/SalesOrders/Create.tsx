import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';

interface Customer { id: number; name: string; }
interface Product  { id: number; name: string; sku: string; }
interface Props { customers: Customer[]; products: Product[]; }

interface LineItem { description: string; quantity: string; unit_price: string; product_id: string; }

export default function Create({ customers, products }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        customer_id: string; order_date: string; expected_date: string; currency: string; notes: string;
        items: LineItem[];
    }>({ customer_id: '', order_date: '', expected_date: '', currency: 'USD', notes: '', items: [{ description: '', quantity: '1', unit_price: '0', product_id: '' }] });

    const addItem = () => setData('items', [...data.items, { description: '', quantity: '1', unit_price: '0', product_id: '' }]);
    const removeItem = (i: number) => setData('items', data.items.filter((_, idx) => idx !== i));
    const updateItem = (i: number, field: keyof LineItem, value: string) => {
        const items = [...data.items];
        items[i] = { ...items[i], [field]: value };
        setData('items', items);
    };

    return (
        <AppLayout>
            <Head title="New Sales Order" />
            <div className="p-6 max-w-3xl">
                <h1 className="text-2xl font-bold mb-4">New Sales Order</h1>
                <form onSubmit={e => { e.preventDefault(); post('/inventory/sales-orders'); }}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Customer</label>
                            <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="">— None —</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Currency</label>
                            <input value={data.currency} onChange={e => setData('currency', e.target.value)} className="w-full border rounded px-3 py-2" maxLength={3} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Order Date *</label>
                            <input type="date" value={data.order_date} onChange={e => setData('order_date', e.target.value)} className="w-full border rounded px-3 py-2" required />
                            {errors.order_date && <p className="text-red-500 text-xs mt-1">{errors.order_date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expected Date</label>
                            <input type="date" value={data.expected_date} onChange={e => setData('expected_date', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="w-full border rounded px-3 py-2" rows={2} />
                    </div>

                    <h2 className="font-semibold mb-2">Line Items</h2>
                    {errors.items && <p className="text-red-500 text-xs mb-2">{errors.items as string}</p>}
                    <table className="w-full text-sm mb-2">
                        <thead><tr className="bg-gray-50"><th className="px-2 py-1 text-left">Description</th><th className="px-2 py-1">Qty</th><th className="px-2 py-1">Unit Price</th><th></th></tr></thead>
                        <tbody>
                            {data.items.map((item, i) => (
                                <tr key={i} className="border-t">
                                    <td className="px-2 py-1"><input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Description" required /></td>
                                    <td className="px-2 py-1"><input type="number" step="0.01" min="0.01" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="w-20 border rounded px-2 py-1" /></td>
                                    <td className="px-2 py-1"><input type="number" step="0.01" min="0" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} className="w-24 border rounded px-2 py-1" /></td>
                                    <td className="px-2 py-1"><button type="button" onClick={() => removeItem(i)} className="text-red-500 text-xs">Remove</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button type="button" onClick={addItem} className="text-blue-600 text-sm mb-4">+ Add Item</button>

                    <div className="flex gap-2 mt-4">
                        <Button type="submit" disabled={processing}>Create Sales Order</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

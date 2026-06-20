import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Contact, SalesOrder, Invoice } from '@/types/finance';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface Props {
    contacts: Pick<Contact, 'id' | 'name'>[];
    salesOrders: Pick<SalesOrder, 'id' | 'reference' | 'number'>[];
    invoices: Pick<Invoice, 'id' | 'reference'>[];
    products: Product[];
    salesOrderId?: string | null;
    invoiceId?: string | null;
}

interface LineItem {
    product_id: string;
    description: string;
    quantity: string;
}

export default function Create({ contacts, salesOrders, invoices, products, salesOrderId, invoiceId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        reference: '',
        sales_order_id: salesOrderId ?? '',
        invoice_id: invoiceId ?? '',
        contact_id: '',
        carrier: '',
        tracking_number: '',
        dispatch_date: '',
        notes: '',
        items: [{ product_id: '', description: '', quantity: '1' }] as LineItem[],
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', description: '', quantity: '1' }]);
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof LineItem, value: string) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('items', newItems);
    };

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => String(p.id) === productId);
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            product_id: productId,
            description: product ? product.name : newItems[index].description,
        };
        setData('items', newItems);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance/delivery-notes');
    };

    return (
        <AppLayout>
            <Head title="New Delivery Note" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/finance/delivery-notes" className="text-gray-500 hover:text-gray-700">
                        &larr; Delivery Notes
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">New Delivery Note</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reference *</label>
                                <input
                                    type="text"
                                    value={data.reference}
                                    onChange={e => setData('reference', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.reference && <p className="mt-1 text-sm text-red-600">{errors.reference}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact</label>
                                <select
                                    value={data.contact_id}
                                    onChange={e => setData('contact_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">— Select Contact —</option>
                                    {contacts.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sales Order</label>
                                <select
                                    value={data.sales_order_id}
                                    onChange={e => setData('sales_order_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">— None —</option>
                                    {salesOrders.map(so => (
                                        <option key={so.id} value={so.id}>{so.number ?? so.reference}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Invoice</label>
                                <select
                                    value={data.invoice_id}
                                    onChange={e => setData('invoice_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">— None —</option>
                                    {invoices.map(inv => (
                                        <option key={inv.id} value={inv.id}>{inv.reference}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Carrier</label>
                                <input
                                    type="text"
                                    value={data.carrier}
                                    onChange={e => setData('carrier', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                                <input
                                    type="text"
                                    value={data.tracking_number}
                                    onChange={e => setData('tracking_number', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dispatch Date</label>
                                <input
                                    type="date"
                                    value={data.dispatch_date}
                                    onChange={e => setData('dispatch_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Line Items</h2>
                        {errors.items && <p className="mb-2 text-sm text-red-600">{errors.items}</p>}
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                                    <th className="pb-2 w-1/3">Product</th>
                                    <th className="pb-2 w-1/3">Description *</th>
                                    <th className="pb-2 w-24">Quantity *</th>
                                    <th className="pb-2 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="space-y-2">
                                {data.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="pr-2 py-1">
                                            <select
                                                value={item.product_id}
                                                onChange={e => handleProductChange(index, e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="">— None —</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="pr-2 py-1">
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={e => updateItem(index, 'description', e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </td>
                                        <td className="pr-2 py-1">
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </td>
                                        <td className="py-1">
                                            {data.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button
                            type="button"
                            onClick={addItem}
                            className="mt-3 text-sm text-indigo-600 hover:text-indigo-900"
                        >
                            + Add Line Item
                        </button>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link
                            href="/finance/delivery-notes"
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create Delivery Note'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

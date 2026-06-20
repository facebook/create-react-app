import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PriceList, PriceListItem, Product } from '@/types/inventory';

interface Props {
    priceList: PriceList & { items: (PriceListItem & { product?: Product })[] };
    products: Pick<Product, 'id' | 'name' | 'sku'>[];
}

export default function Show({ priceList, products }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '' as string | number,
        price: '',
        min_quantity: '1',
    });

    function submitItem(e: React.FormEvent) {
        e.preventDefault();
        post(`/inventory/price-lists/${priceList.id}/items`, {
            onSuccess: () => reset(),
        });
    }

    function removeItem(itemId: number) {
        router.delete(`/inventory/price-lists/${priceList.id}/items/${itemId}`);
    }

    return (
        <AppLayout>
            <Head title={`Price List: ${priceList.name}`} />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">{priceList.name}</h1>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>Currency: <strong>{priceList.currency}</strong></span>
                        <span>Status: <strong>{priceList.is_active ? 'Active' : 'Inactive'}</strong></span>
                        {priceList.is_default && <span className="text-green-600 font-medium">Default</span>}
                        {priceList.valid_from && <span>From: {priceList.valid_from}</span>}
                        {priceList.valid_to && <span>To: {priceList.valid_to}</span>}
                    </div>
                    {priceList.notes && <p className="mt-2 text-gray-600">{priceList.notes}</p>}
                </div>

                <div className="bg-white rounded shadow overflow-hidden mb-6">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Product</th>
                                <th className="px-4 py-2 text-right">Price</th>
                                <th className="px-4 py-2 text-right">Min Qty</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {priceList.items.map(item => (
                                <tr key={item.id} className="border-t">
                                    <td className="px-4 py-2">{item.product?.name ?? `Product #${item.product_id}`}</td>
                                    <td className="px-4 py-2 text-right">{Number(item.price).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right">{item.min_quantity}</td>
                                    <td className="px-4 py-2 text-right">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-600 hover:underline text-xs"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {priceList.items.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                                        No items yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded shadow p-4">
                    <h2 className="text-lg font-semibold mb-3">Add Item</h2>
                    <form onSubmit={submitItem} className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product *</label>
                            <select
                                value={data.product_id}
                                onChange={e => setData('product_id', e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm"
                            >
                                <option value="">Select product...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                ))}
                            </select>
                            {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Price *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.price}
                                onChange={e => setData('price', e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm w-28"
                                placeholder="0.00"
                            />
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Min Qty</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.min_quantity}
                                onChange={e => setData('min_quantity', e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm w-24"
                                placeholder="1"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm disabled:opacity-50"
                        >
                            Add Item
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

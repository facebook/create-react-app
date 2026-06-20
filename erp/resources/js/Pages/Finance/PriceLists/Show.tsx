import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { PriceList, PriceListItem } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    priceList: PriceList;
    items: Paginator<PriceListItem>;
}

export default function PriceListShow({ priceList, items, auth }: Props) {
    const canDelete = auth.user?.permissions?.includes('finance.delete');
    const canCreate = auth.user?.permissions?.includes('finance.create');

    const { data, setData, post, processing, reset, errors } = useForm({
        product_id: '',
        unit_price: '',
        min_quantity: '1',
    });

    function handleDelete() {
        if (!confirm(`Delete "${priceList.name}"? This cannot be undone.`)) return;
        router.delete(`/finance/price-lists/${priceList.id}`);
    }

    function handleRemoveItem(itemId: number) {
        if (!confirm('Remove this item?')) return;
        router.delete(`/finance/price-lists/${priceList.id}/items/${itemId}`);
    }

    function handleAddItem(e: React.FormEvent) {
        e.preventDefault();
        post(`/finance/price-lists/${priceList.id}/items`, {
            onSuccess: () => reset(),
        });
    }

    return (
        <AppLayout>
            <Head title={priceList.name} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{priceList.name}</h1>
                        {priceList.description && (
                            <p className="mt-1 text-sm text-slate-500">{priceList.description}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link href="/finance/price-lists">
                            <Button variant="secondary">Back to List</Button>
                        </Link>
                        {canDelete && (
                            <Button variant="danger" onClick={handleDelete}>Delete</Button>
                        )}
                    </div>
                </div>

                {/* Details card */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Currency</p>
                        <p className="mt-1 text-xl font-semibold text-slate-900">{priceList.currency_code}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Default</p>
                        <p className={`mt-1 text-xl font-semibold ${priceList.is_default ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {priceList.is_default ? 'Yes' : 'No'}
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Valid From</p>
                        <p className="mt-1 text-base font-medium text-slate-900">{priceList.valid_from ?? '—'}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Valid To</p>
                        <p className="mt-1 text-base font-medium text-slate-900">{priceList.valid_to ?? '—'}</p>
                    </div>
                </div>

                {/* Items table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-900">Price List Items</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Min Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Price</th>
                                {canDelete && <th className="px-4 py-3" />}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                                        No items in this price list.
                                    </td>
                                </tr>
                            )}
                            {items.data.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-900">
                                        {item.product ? `[${item.product.sku}] ${item.product.name}` : `Product #${item.product_id}`}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600">{item.min_quantity}</td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                                        {Number(item.unit_price).toFixed(4)}
                                    </td>
                                    {canDelete && (
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Item form */}
                {canCreate && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Add Item</h2>
                        <form onSubmit={handleAddItem} className="flex items-end gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product ID</label>
                                <input
                                    type="number"
                                    value={data.product_id}
                                    onChange={(e) => setData('product_id', e.target.value)}
                                    placeholder="Product ID"
                                    className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.product_id && <p className="mt-1 text-xs text-red-500">{errors.product_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    min="0"
                                    value={data.unit_price}
                                    onChange={(e) => setData('unit_price', e.target.value)}
                                    placeholder="0.00"
                                    className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.unit_price && <p className="mt-1 text-xs text-red-500">{errors.unit_price}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Min Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.min_quantity}
                                    onChange={(e) => setData('min_quantity', e.target.value)}
                                    className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.min_quantity && <p className="mt-1 text-xs text-red-500">{errors.min_quantity}</p>}
                            </div>
                            <Button type="submit" disabled={processing}>Add Item</Button>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

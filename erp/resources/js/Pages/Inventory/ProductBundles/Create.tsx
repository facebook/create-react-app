import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Product } from '@/types/inventory';

interface BundleItem {
    component_product_id: string;
    quantity: string;
}

interface Props extends PageProps {
    products: Product[];
}

export default function ProductBundleCreate({ products }: Props) {
    const { data, setData, post, errors, processing } = useForm<{
        name: string;
        sku: string;
        description: string;
        selling_price: string;
        items: BundleItem[];
    }>({
        name: '',
        sku: '',
        description: '',
        selling_price: '',
        items: [{ component_product_id: '', quantity: '1' }],
    });

    function addRow() {
        setData('items', [...data.items, { component_product_id: '', quantity: '1' }]);
    }

    function removeRow(index: number) {
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    }

    function updateItem(index: number, field: keyof BundleItem, value: string) {
        const updated = data.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item,
        );
        setData('items', updated);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/product-bundles');
    }

    return (
        <AppLayout>
            <Head title="New Bundle" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href="/inventory/product-bundles"
                        className="text-sm text-slate-500 hover:text-slate-700"
                    >
                        ← Bundles
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">New Bundle</h1>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Bundle info */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Bundle Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                                <input
                                    type="text"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.sku && (
                                    <p className="mt-1 text-xs text-red-600">{errors.sku}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Selling Price
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.selling_price}
                                    onChange={(e) => setData('selling_price', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.selling_price && (
                                    <p className="mt-1 text-xs text-red-600">{errors.selling_price}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Components table */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-slate-700">
                                    Components <span className="text-red-500">*</span>
                                </h2>
                                <Button type="button" variant="secondary" size="sm" onClick={addRow}>
                                    + Add Component
                                </Button>
                            </div>
                            {errors.items && (
                                <p className="mb-2 text-xs text-red-600">{errors.items}</p>
                            )}
                            <div className="overflow-hidden rounded-md border border-slate-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Product</th>
                                            <th className="px-4 py-2 text-left font-medium w-36">Quantity</th>
                                            <th className="px-4 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={item.component_product_id}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'component_product_id',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="">Select product…</option>
                                                        {products.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name}{p.sku ? ` (${p.sku})` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        min="0.0001"
                                                        step="0.0001"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateItem(index, 'quantity', e.target.value)
                                                        }
                                                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {data.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow(index)}
                                                            className="text-red-500 hover:text-red-700 text-xs"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Link href="/inventory/product-bundles">
                                <Button type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating…' : 'Create Bundle'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

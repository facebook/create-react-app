import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Product, ProductAttribute } from '@/types/inventory';

interface Props extends PageProps {
    products: Product[];
    attributes: ProductAttribute[];
}

interface VariantValue {
    attribute_id: number;
    value: string;
}

export default function CreateProductVariant({ products, attributes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '' as string | number,
        sku: '',
        name: '',
        price_adjustment: 0,
        stock_quantity: 0,
        values: [] as VariantValue[],
    });

    function setAttributeValue(attributeId: number, value: string) {
        const values = [...data.values];
        const idx = values.findIndex((v) => v.attribute_id === attributeId);
        if (idx >= 0) {
            values[idx] = { attribute_id: attributeId, value };
        } else {
            values.push({ attribute_id: attributeId, value });
        }
        setData('values', values);
    }

    function getAttributeValue(attributeId: number): string {
        return data.values.find((v) => v.attribute_id === attributeId)?.value ?? '';
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/product-variants');
    }

    return (
        <AppLayout>
            <Head title="New Product Variant" />
            <div className="p-6 max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-800">New Product Variant</h1>

                <form onSubmit={submit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product *</label>
                        <select
                            value={data.product_id}
                            onChange={(e) => setData('product_id', e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a product…</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </select>
                        {errors.product_id && <p className="mt-1 text-xs text-red-600">{errors.product_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
                            <input
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="PROD-RED-L"
                            />
                            {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Variant Name *</label>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Red / Large"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price Adjustment</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.price_adjustment}
                                onChange={(e) => setData('price_adjustment', parseFloat(e.target.value) || 0)}
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                            <input
                                type="number"
                                min="0"
                                value={data.stock_quantity}
                                onChange={(e) => setData('stock_quantity', parseInt(e.target.value) || 0)}
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {attributes.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-700">Attribute Values</h3>
                            {attributes.map((attr) => (
                                <div key={attr.id}>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">{attr.name}</label>
                                    {(attr.type === 'select' || attr.type === 'color') && attr.options ? (
                                        <select
                                            value={getAttributeValue(attr.id)}
                                            onChange={(e) => setAttributeValue(attr.id, e.target.value)}
                                            className="rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">— select —</option>
                                            {attr.options.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            value={getAttributeValue(attr.id)}
                                            onChange={(e) => setAttributeValue(attr.id, e.target.value)}
                                            className="rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <Button type="submit" disabled={processing}>Create Variant</Button>
                </form>
            </div>
        </AppLayout>
    );
}

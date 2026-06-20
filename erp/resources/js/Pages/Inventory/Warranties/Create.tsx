import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface Props extends PageProps {
    products: Product[];
}

export default function WarrantyCreate({ products }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        name:            '',
        product_id:      '',
        duration_months: '',
        warranty_type:   'standard',
        terms:           '',
        is_default:      false as boolean,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/warranties');
    }

    return (
        <AppLayout>
            <Head title="New Warranty" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Product Warranty</h1>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Product *</label>
                            <select
                                value={data.product_id}
                                onChange={(e) => setData('product_id', e.target.value)}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Select a product</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                ))}
                            </select>
                            {errors.product_id && <p className="text-red-600 text-sm mt-1">{errors.product_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. 1-Year Standard Warranty"
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            />
                            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (months) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.duration_months}
                                    onChange={(e) => setData('duration_months', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                />
                                {errors.duration_months && <p className="text-red-600 text-sm mt-1">{errors.duration_months}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Type</label>
                                <select
                                    value={data.warranty_type}
                                    onChange={(e) => setData('warranty_type', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="standard">Standard</option>
                                    <option value="extended">Extended</option>
                                    <option value="limited">Limited</option>
                                </select>
                                {errors.warranty_type && <p className="text-red-600 text-sm mt-1">{errors.warranty_type}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Terms & Conditions</label>
                            <textarea
                                value={data.terms}
                                onChange={(e) => setData('terms', e.target.value)}
                                rows={4}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_default"
                                checked={data.is_default}
                                onChange={(e) => setData('is_default', e.target.checked)}
                                className="rounded border-slate-300"
                            />
                            <label htmlFor="is_default" className="text-sm text-slate-700">Set as default warranty for this product</label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>Create Warranty</Button>
                            <a href="/inventory/warranties" className="inline-flex items-center px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
                                Cancel
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

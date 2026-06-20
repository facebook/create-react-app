import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string | null;
}

interface ProductWarranty {
    id: number;
    name: string;
    product_id: number | null;
    duration_months: number;
    warranty_type: 'standard' | 'extended' | 'limited' | null;
    terms: string | null;
    is_default: boolean;
}

interface Props extends PageProps {
    warranty: ProductWarranty;
    products: Product[];
}

export default function WarrantyEdit({ warranty, products }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: warranty.name ?? '',
        product_id: warranty.product_id ? String(warranty.product_id) : '',
        duration_months: warranty.duration_months ?? 12,
        warranty_type: warranty.warranty_type ?? '',
        terms: warranty.terms ?? '',
        is_default: warranty.is_default ?? false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/inventory/warranties/${warranty.id}`);
    }

    const inputClass =
        'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

    return (
        <AppLayout>
            <Head title={`Edit Warranty — ${warranty.name}`} />
            <div className="mx-auto max-w-lg space-y-6">
                <div>
                    <p className="text-sm text-slate-500">
                        <Link href="/inventory/warranties" className="text-indigo-600 hover:underline">
                            Warranties
                        </Link>{' '}
                        &rsaquo; Edit
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-900">Edit Warranty</h1>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={inputClass}
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Product</label>
                            <select
                                value={data.product_id}
                                onChange={(e) => setData('product_id', e.target.value)}
                                className={inputClass}
                            >
                                <option value="">— No specific product —</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}{p.sku ? ` (${p.sku})` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.product_id && (
                                <p className="mt-1 text-xs text-red-600">{errors.product_id}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Duration (Months) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={data.duration_months}
                                    onChange={(e) => setData('duration_months', Number(e.target.value))}
                                    className={inputClass}
                                    required
                                />
                                {errors.duration_months && (
                                    <p className="mt-1 text-xs text-red-600">{errors.duration_months}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Warranty Type</label>
                                <select
                                    value={data.warranty_type}
                                    onChange={(e) => setData('warranty_type', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">— Select Type —</option>
                                    <option value="standard">Standard</option>
                                    <option value="extended">Extended</option>
                                    <option value="limited">Limited</option>
                                </select>
                                {errors.warranty_type && (
                                    <p className="mt-1 text-xs text-red-600">{errors.warranty_type}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Terms</label>
                            <textarea
                                value={data.terms}
                                onChange={(e) => setData('terms', e.target.value)}
                                className={inputClass}
                                rows={4}
                                placeholder="Warranty terms and conditions..."
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={data.is_default}
                                onChange={(e) => setData('is_default', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                            />
                            Set as default warranty for this product
                        </label>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Link href="/inventory/warranties">
                                <Button variant="secondary" type="button">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

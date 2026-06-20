import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Link, useForm } from '@inertiajs/react';

interface Category {
    id: number;
    name: string;
}

interface StoreProductData {
    id: number;
    product_id: number;
    category_id: number | null;
    store_price: number;
    compare_price: number | null;
    is_featured: boolean;
    is_visible: boolean;
    sort_order: number;
    short_description: string | null;
    long_description: string | null;
    meta_title: string | null;
    meta_description: string | null;
    product: { id: number; name: string; sku: string | null } | null;
    category: { id: number; name: string } | null;
}

interface Props {
    storeProduct: StoreProductData;
    categories: Category[];
}

export default function StoreProductEdit({ storeProduct, categories }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        category_id:       storeProduct.category_id ? String(storeProduct.category_id) : '',
        store_price:       String(storeProduct.store_price),
        compare_price:     storeProduct.compare_price != null ? String(storeProduct.compare_price) : '',
        is_featured:       storeProduct.is_featured,
        is_visible:        storeProduct.is_visible,
        sort_order:        String(storeProduct.sort_order),
        short_description: storeProduct.short_description ?? '',
        long_description:  storeProduct.long_description ?? '',
        meta_title:        storeProduct.meta_title ?? '',
        meta_description:  storeProduct.meta_description ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/ecommerce/products/${storeProduct.id}`);
    };

    return (
        <AppLayout title="Edit Store Product">
            <div className="p-6 max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/ecommerce/products" className="text-sm text-slate-500 hover:text-slate-700">
                        ← Back to Products
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Edit: {storeProduct.product?.name ?? `Product #${storeProduct.product_id}`}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select
                                value={data.category_id}
                                onChange={e => setData('category_id', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">No Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
                            <input
                                type="number"
                                min="0"
                                value={data.sort_order}
                                onChange={e => setData('sort_order', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Store Price *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.store_price}
                                onChange={e => setData('store_price', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                            {errors.store_price && <p className="mt-1 text-sm text-red-600">{errors.store_price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Compare Price (was)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.compare_price}
                                onChange={e => setData('compare_price', e.target.value)}
                                placeholder="Optional"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
                            <textarea
                                value={data.short_description}
                                onChange={e => setData('short_description', e.target.value)}
                                rows={2}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Long Description</label>
                            <textarea
                                value={data.long_description}
                                onChange={e => setData('long_description', e.target.value)}
                                rows={5}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                            <input
                                type="text"
                                value={data.meta_title}
                                onChange={e => setData('meta_title', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                            <input
                                type="text"
                                value={data.meta_description}
                                onChange={e => setData('meta_description', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="sm:col-span-2 flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={e => setData('is_featured', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                />
                                <span className="text-sm font-medium text-slate-700">Featured Product</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_visible}
                                    onChange={e => setData('is_visible', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                />
                                <span className="text-sm font-medium text-slate-700">Visible in Store</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href="/ecommerce/products">
                            <Button variant="secondary" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

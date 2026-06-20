import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Link, useForm } from '@inertiajs/react';

interface InventoryProduct {
    id: number;
    name: string;
    sku: string | null;
    sale_price: string | null;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    inventoryProducts: InventoryProduct[];
    categories: Category[];
}

export default function StoreProductCreate({ inventoryProducts, categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        product_id:        '',
        category_id:       '',
        store_price:       '',
        compare_price:     '',
        is_featured:       false as boolean,
        is_visible:        true as boolean,
        sort_order:        '0',
        short_description: '',
        long_description:  '',
        meta_title:        '',
        meta_description:  '',
    });

    const handleProductChange = (productId: string) => {
        setData('product_id', productId);
        const product = inventoryProducts.find(p => String(p.id) === productId);
        if (product?.sale_price) {
            setData('store_price', product.sale_price);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/ecommerce/products');
    };

    return (
        <AppLayout title="Add Store Product">
            <div className="p-6 max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/ecommerce/products" className="text-sm text-slate-500 hover:text-slate-700">
                        ← Back to Products
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">Add Product to Store</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Inventory Product *</label>
                            <select
                                value={data.product_id}
                                onChange={e => handleProductChange(e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select a product...</option>
                                {inventoryProducts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</option>
                                ))}
                            </select>
                            {errors.product_id && <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>}
                        </div>

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
                            {processing ? 'Adding...' : 'Add to Store'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

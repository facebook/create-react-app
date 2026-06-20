import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Link, router } from '@inertiajs/react';

interface Product {
    id: number;
    name: string;
    sku: string | null;
}

interface Category {
    id: number;
    name: string;
}

interface StoreProduct {
    id: number;
    store_price: number;
    compare_price: number | null;
    is_featured: boolean;
    is_visible: boolean;
    sort_order: number;
    product: Product | null;
    category: Category | null;
}

interface PaginatedProducts {
    data: StoreProduct[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    storeProducts: PaginatedProducts;
    categories: Category[];
    filters: {
        category_id?: string;
        is_visible?: string;
        is_featured?: string;
    };
}

export default function StoreProductsIndex({ storeProducts, categories, filters }: Props) {
    const handleFilter = (key: string, value: string) => {
        router.get('/ecommerce/products', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Remove this product from the store?')) {
            router.delete(`/ecommerce/products/${id}`);
        }
    };

    return (
        <AppLayout title="Store Products">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Store Products</h1>
                    <Link href="/ecommerce/products/create">
                        <Button>Add Product</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.category_id ?? ''}
                        onChange={e => handleFilter('category_id', e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <select
                        value={filters.is_visible ?? ''}
                        onChange={e => handleFilter('is_visible', e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Visibility</option>
                        <option value="1">Visible</option>
                        <option value="0">Hidden</option>
                    </select>

                    <select
                        value={filters.is_featured ?? ''}
                        onChange={e => handleFilter('is_featured', e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Products</option>
                        <option value="1">Featured Only</option>
                        <option value="0">Non-Featured</option>
                    </select>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">SKU</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Store Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Compare Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Featured</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Visible</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {storeProducts.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">No store products yet.</td>
                                </tr>
                            ) : storeProducts.data.map(sp => (
                                <tr key={sp.id}>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                        {sp.product?.name ?? '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{sp.product?.sku ?? '—'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700 text-right">${sp.store_price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-400 text-right">
                                        {sp.compare_price != null ? (
                                            <span className="line-through">${sp.compare_price.toFixed(2)}</span>
                                        ) : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{sp.category?.name ?? '—'}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {sp.is_featured && (
                                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Featured</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sp.is_visible ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {sp.is_visible ? 'Visible' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right space-x-3">
                                        <Link href={`/ecommerce/products/${sp.id}/edit`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                                        <button onClick={() => handleDelete(sp.id)} className="text-red-600 hover:text-red-900">Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {storeProducts.last_page > 1 && (
                    <p className="text-sm text-slate-500 text-center">
                        Page {storeProducts.current_page} of {storeProducts.last_page} — {storeProducts.total} total products
                    </p>
                )}
            </div>
        </AppLayout>
    );
}

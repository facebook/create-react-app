import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { StockLevelBadge } from '@/Components/Inventory/StockLevelBadge';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Product, ProductCategory, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    products: Paginator<Product>;
    categories: Pick<ProductCategory, 'id' | 'name' | 'colour'>[];
    filters: { search?: string; category_id?: string };
}

export default function ProductsIndex({ products, categories, filters }: Props) {
    const { can } = usePermission();
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/inventory/products', { search, category_id: filters.category_id }, { preserveState: true, replace: true });
    }

    function handleCategoryFilter(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value;
        router.get('/inventory/products', { category_id: value || undefined, search: filters.search }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Products" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
                        <p className="text-sm text-slate-500 mt-1">{products.total} products total</p>
                    </div>
                    <div className="flex gap-2">
                        {can('inventory.view') && (
                            <Button variant="secondary" onClick={() => { window.location.href = '/export/products'; }}>Export CSV</Button>
                        )}
                        {can('inventory.create') && (
                            <Link href="/inventory/products/create">
                                <Button>Add Product</Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or SKU..."
                                    className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <Button type="submit" variant="secondary" size="sm">Search</Button>
                            </form>
                            <select
                                value={filters.category_id ?? ''}
                                onChange={handleCategoryFilter}
                                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <Table
                        columns={[
                            { key: 'sku', header: 'SKU', className: 'font-mono text-xs' },
                            { key: 'name', header: 'Name', render: (p) => (
                                <Link href={`/inventory/products/${p.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                    {p.name}
                                </Link>
                            )},
                            { key: 'category', header: 'Category', render: (p) => p.category ? (
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                                    style={{ backgroundColor: p.category.colour }}
                                >
                                    {p.category.name}
                                </span>
                            ) : <span className="text-slate-400 text-xs">—</span> },
                            { key: 'sale_price', header: 'Sale Price', render: (p) => `$${Number(p.sale_price).toFixed(2)}` },
                            { key: 'stock', header: 'Stock', render: (p) => (
                                <div className="flex items-center gap-1.5">
                                    <StockLevelBadge quantity={p.total_quantity ?? 0} reorderPoint={p.reorder_point} />
                                    {p.needs_reorder && (
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                                            &#9888; Reorder
                                        </span>
                                    )}
                                </div>
                            )},
                            { key: 'status', header: 'Status', render: (p) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {p.is_active ? 'Active' : 'Inactive'}
                                </span>
                            )},
                            { key: 'actions', header: '', render: (p) => (
                                <div className="flex gap-2">
                                    {can('inventory.update') && (
                                        <Link href={`/inventory/products/${p.id}/edit`} className="text-sm text-indigo-600 hover:text-indigo-800">Edit</Link>
                                    )}
                                </div>
                            )},
                        ]}
                        data={products.data}
                        emptyMessage="No products found."
                    />
                    <Pagination paginator={products} />
                </div>
            </div>
        </AppLayout>
    );
}

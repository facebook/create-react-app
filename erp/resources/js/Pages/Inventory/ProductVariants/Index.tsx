import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Product, ProductVariant } from '@/types/inventory';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    variants: Paginator<ProductVariant>;
    products: Product[];
    filters: { product_id?: string };
}

export default function ProductVariantsIndex({ variants, products, filters }: Props) {
    const { can } = usePermission();

    function filterByProduct(productId: string) {
        router.get('/inventory/product-variants', { product_id: productId || undefined }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Product Variants" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">Product Variants</h1>
                    {can('inventory.create') && (
                        <Link href="/inventory/product-variants/create">
                            <Button>New Variant</Button>
                        </Link>
                    )}
                </div>

                <div>
                    <select
                        value={filters.product_id ?? ''}
                        onChange={(e) => filterByProduct(e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Products</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                    </select>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-4 py-3 text-left font-medium text-slate-600">SKU</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Product</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Stock</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Price Adj.</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Active</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {variants.data.map((v) => (
                                <tr key={v.id} className="border-b border-slate-100 last:border-0">
                                    <td className="px-4 py-3 font-mono text-xs">{v.sku}</td>
                                    <td className="px-4 py-3 font-medium">{v.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{v.product?.name ?? '—'}</td>
                                    <td className="px-4 py-3">{v.stock_quantity}</td>
                                    <td className="px-4 py-3">{Number(v.price_adjustment) >= 0 ? '+' : ''}{Number(v.price_adjustment).toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {v.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/inventory/product-variants/${v.id}`} className="text-sm text-blue-600 hover:underline">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {variants.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-500">No variants found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

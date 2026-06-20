import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Product, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    products: Paginator<Product & { costing_layers_count: number }>;
    filters: { product_id?: string };
}

export default function CostingIndex({ products, filters }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Inventory Costing" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Inventory Costing</h1>
                        <p className="text-sm text-slate-500 mt-1">{products.total} products</p>
                    </div>
                    {can('inventory.view') && (
                        <Link href="/inventory/costing/report">
                            <Button>View Report</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Product</th>
                                <th className="px-4 py-2 text-left font-medium">SKU</th>
                                <th className="px-4 py-2 text-left font-medium">Active Layers</th>
                                <th className="px-4 py-2 text-left font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.data.length === 0 ? (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No products found.</td></tr>
                            ) : products.data.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{product.sku}</td>
                                    <td className="px-4 py-3 text-slate-600">{product.costing_layers_count}</td>
                                    <td className="px-4 py-3 flex items-center gap-3">
                                        <Link
                                            href={`/inventory/costing/${product.id}/layers`}
                                            className="text-indigo-600 hover:underline text-xs"
                                        >
                                            View Layers
                                        </Link>
                                        {can('inventory.create') && (
                                            <SnapshotForm productId={product.id} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {products.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {products.prev_page_url && (
                            <Link href={products.prev_page_url} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">&larr; Previous</Link>
                        )}
                        <span className="px-3 py-1.5 text-sm text-slate-500">Page {products.current_page} of {products.last_page}</span>
                        {products.next_page_url && (
                            <Link href={products.next_page_url} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Next &rarr;</Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function SnapshotForm({ productId }: { productId: number }) {
    const { post, processing } = useForm({ product_id: productId });

    function handleSnapshot(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/costing/snapshot');
    }

    return (
        <form onSubmit={handleSnapshot} className="inline">
            <button
                type="submit"
                disabled={processing}
                className="text-xs text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
                Snapshot
            </button>
        </form>
    );
}

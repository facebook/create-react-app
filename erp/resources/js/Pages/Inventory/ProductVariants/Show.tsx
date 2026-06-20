import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ProductVariant } from '@/types/inventory';

interface Props extends PageProps {
    variant: ProductVariant;
}

export default function ShowProductVariant({ variant }: Props) {
    const { can } = usePermission();
    const { data, setData, patch, processing } = useForm({ delta: 0 });

    function adjustStock(e: React.FormEvent) {
        e.preventDefault();
        patch(`/inventory/product-variants/${variant.id}/adjust-stock`);
    }

    function destroy() {
        if (!confirm('Delete this variant permanently?')) return;
        // @ts-ignore
        window.axios.delete(`/inventory/product-variants/${variant.id}`).then(() => {
            window.location.href = '/inventory/product-variants';
        });
    }

    return (
        <AppLayout>
            <Head title={`Variant: ${variant.name}`} />
            <div className="space-y-6 p-6 max-w-3xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">{variant.name}</h1>
                        <p className="text-sm text-slate-500 font-mono">{variant.sku}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/inventory/product-variants">
                            <Button variant="secondary">Back</Button>
                        </Link>
                        {can('inventory.delete') && (
                            <button onClick={destroy} className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100">
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-700 mb-3">Details</h2>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Product</dt>
                                <dd className="font-medium">{variant.product?.name ?? '—'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Price Adjustment</dt>
                                <dd className="font-medium">{Number(variant.price_adjustment) >= 0 ? '+' : ''}{Number(variant.price_adjustment).toFixed(2)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Effective Price</dt>
                                <dd className="font-medium">{Number(variant.effective_price).toFixed(2)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Stock</dt>
                                <dd className="font-semibold text-blue-700">{variant.stock_quantity}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Status</dt>
                                <dd>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${variant.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {variant.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-700 mb-3">Attribute Values</h2>
                        {variant.values && variant.values.length > 0 ? (
                            <dl className="space-y-2 text-sm">
                                {variant.values.map((v) => (
                                    <div key={v.id} className="flex justify-between">
                                        <dt className="text-slate-500">{v.attribute?.name ?? `Attr #${v.attribute_id}`}</dt>
                                        <dd className="font-medium">{v.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : (
                            <p className="text-sm text-slate-400">No attribute values.</p>
                        )}
                    </div>
                </div>

                {can('inventory.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-700 mb-3">Adjust Stock</h2>
                        <form onSubmit={adjustStock} className="flex items-end gap-3">
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Delta (positive = add, negative = remove)</label>
                                <input
                                    type="number"
                                    value={data.delta}
                                    onChange={(e) => setData('delta', parseInt(e.target.value) || 0)}
                                    className="rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>Apply</Button>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

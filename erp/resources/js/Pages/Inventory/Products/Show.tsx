import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { StockLevelBadge } from '@/Components/Inventory/StockLevelBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Product, StockMovement, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    product: Product;
    movements: Paginator<StockMovement>;
    suppliers: { id: number; name: string }[];
}

export default function ProductShow({ product, movements, suppliers }: Props) {
    const { can } = usePermission();
    const [showAdjust, setShowAdjust] = useState(false);
    const [adjustForm, setAdjustForm] = useState({
        warehouse_id: '',
        type: 'in' as 'in' | 'out',
        quantity: '',
        reference: '',
        notes: '',
    });

    const reorderForm = useForm({
        reorder_point: String(product.reorder_point ?? 0),
        reorder_quantity: String(product.reorder_quantity ?? 0),
        preferred_supplier_id: String(product.preferred_supplier_id ?? ''),
    });

    function submitReorderSettings(e: React.FormEvent) {
        e.preventDefault();
        reorderForm.patch(`/inventory/products/${product.id}`, {
            preserveScroll: true,
        });
    }

    function handleDelete() {
        if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
        router.delete(`/inventory/products/${product.id}`);
    }

    function submitAdjustment(e: React.FormEvent) {
        e.preventDefault();
        router.post('/inventory/stock-movements', {
            product_id: product.id,
            warehouse_id: Number(adjustForm.warehouse_id),
            type: adjustForm.type,
            quantity: Number(adjustForm.quantity),
            reference: adjustForm.reference || undefined,
            notes: adjustForm.notes || undefined,
        } as any, {
            onSuccess: () => {
                setShowAdjust(false);
                setAdjustForm({ warehouse_id: '', type: 'in', quantity: '', reference: '', notes: '' });
            },
        });
    }

    return (
        <AppLayout>
            <Head title={product.name} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/inventory/products" className="text-sm text-slate-500 hover:text-slate-700">
                            ← Products
                        </Link>
                        <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {can('inventory.update') && (
                            <Link href={`/inventory/products/${product.id}/edit`}>
                                <Button variant="secondary" size="sm">Edit</Button>
                            </Link>
                        )}
                        {can('inventory.delete') && (
                            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Details</h2>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt className="text-slate-500">SKU</dt>
                                <dd className="font-mono font-medium text-slate-900">{product.sku}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Category</dt>
                                <dd className="font-medium text-slate-900">{product.category?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Unit of Measure</dt>
                                <dd className="font-medium text-slate-900">{product.uom ? `${product.uom.name} (${product.uom.abbreviation})` : '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Reorder Point</dt>
                                <dd className="font-medium text-slate-900">{product.reorder_point}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Cost Price</dt>
                                <dd className="font-medium text-slate-900">${Number(product.cost_price).toFixed(2)}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Sale Price</dt>
                                <dd className="font-medium text-slate-900">${Number(product.sale_price).toFixed(2)}</dd>
                            </div>
                            {product.description && (
                                <div className="col-span-2">
                                    <dt className="text-slate-500">Description</dt>
                                    <dd className="text-slate-900">{product.description}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h2 className="text-base font-semibold text-slate-900">Stock Levels</h2>
                            {can('inventory.update') && (
                                <button
                                    onClick={() => setShowAdjust((v) => !v)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    {showAdjust ? 'Cancel' : '+ Adjust'}
                                </button>
                            )}
                        </div>
                        {product.stock_levels && product.stock_levels.length > 0 ? (
                            <ul className="space-y-3">
                                {product.stock_levels.map((sl) => (
                                    <li key={sl.warehouse_id} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">{sl.warehouse_name}</span>
                                        <StockLevelBadge quantity={sl.available} reorderPoint={product.reorder_point} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-400">No stock recorded yet.</p>
                        )}
                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Total</span>
                            <StockLevelBadge quantity={product.total_quantity ?? 0} reorderPoint={product.reorder_point} />
                        </div>

                        {/* Stock adjustment form */}
                        {showAdjust && (
                            <form onSubmit={submitAdjustment} className="border-t border-slate-100 pt-4 space-y-3">
                                <h3 className="text-sm font-medium text-slate-700">Record Stock Movement</h3>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Warehouse</label>
                                    <select
                                        value={adjustForm.warehouse_id}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, warehouse_id: e.target.value })}
                                        required
                                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select warehouse…</option>
                                        {(product.stock_levels ?? []).map((sl) => (
                                            <option key={sl.warehouse_id} value={sl.warehouse_id}>{sl.warehouse_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input type="radio" name="type" value="in" checked={adjustForm.type === 'in'}
                                            onChange={() => setAdjustForm({ ...adjustForm, type: 'in' })} />
                                        <span className="text-green-700 font-medium">In</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input type="radio" name="type" value="out" checked={adjustForm.type === 'out'}
                                            onChange={() => setAdjustForm({ ...adjustForm, type: 'out' })} />
                                        <span className="text-red-700 font-medium">Out</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                                    <input type="number" min="0.01" step="0.01" required
                                        value={adjustForm.quantity}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Reference</label>
                                    <input type="text" value={adjustForm.reference}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, reference: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Notes</label>
                                    <textarea value={adjustForm.notes} rows={2}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <Button type="submit" size="sm" className="w-full">Record Movement</Button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Reorder Settings */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h2 className="text-base font-semibold text-slate-900">Reorder Settings</h2>
                        {product.needs_reorder && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                &#9888; Below reorder point
                            </span>
                        )}
                    </div>
                    {can('inventory.update') ? (
                        <form onSubmit={submitReorderSettings} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Reorder Point</label>
                                <input
                                    type="number" min="0" step="0.01"
                                    value={reorderForm.data.reorder_point}
                                    onChange={(e) => reorderForm.setData('reorder_point', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Reorder Quantity</label>
                                <input
                                    type="number" min="0" step="0.01"
                                    value={reorderForm.data.reorder_quantity}
                                    onChange={(e) => reorderForm.setData('reorder_quantity', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Preferred Supplier</label>
                                <select
                                    value={reorderForm.data.preferred_supplier_id}
                                    onChange={(e) => reorderForm.setData('preferred_supplier_id', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">None</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-3 flex justify-end">
                                <Button type="submit" size="sm" disabled={reorderForm.processing}>
                                    {reorderForm.processing ? 'Saving…' : 'Save Reorder Settings'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <dl className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <dt className="text-slate-500">Reorder Point</dt>
                                <dd className="font-medium text-slate-900">{product.reorder_point}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Reorder Quantity</dt>
                                <dd className="font-medium text-slate-900">{product.reorder_quantity ?? 0}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Preferred Supplier</dt>
                                <dd className="font-medium text-slate-900">{product.preferred_supplier?.name ?? '—'}</dd>
                            </div>
                        </dl>
                    )}
                </div>

                {/* Stock movement history */}
                {movements && movements.data && movements.data.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                            <h2 className="text-sm font-medium text-slate-700">Recent Stock Movements</h2>
                            <Link href={`/inventory/stock-movements?product_id=${product.id}`} className="text-xs text-indigo-600 hover:text-indigo-800">View all →</Link>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Date</th>
                                    <th className="px-4 py-2 text-left font-medium">Type</th>
                                    <th className="px-4 py-2 text-left font-medium">Warehouse</th>
                                    <th className="px-4 py-2 text-right font-medium">Qty</th>
                                    <th className="px-4 py-2 text-left font-medium">Reference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {movements.data.map((m: StockMovement) => (
                                    <tr key={m.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 text-slate-500">{new Date(m.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                m.type === 'in' ? 'bg-green-100 text-green-700' :
                                                m.type === 'out' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-600'}`}>
                                                {m.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-slate-600">{m.warehouse?.name ?? '—'}</td>
                                        <td className={`px-4 py-2 text-right font-medium ${m.type === 'out' ? 'text-red-600' : 'text-green-600'}`}>
                                            {m.type === 'out' ? '-' : '+'}{Number(m.quantity).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-slate-400 text-xs">{m.reference ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

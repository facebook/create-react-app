import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { WarehouseBin, BinStockLocation } from '@/types/inventory';

interface Props extends PageProps {
    bin: WarehouseBin;
}

const binTypeColors: Record<string, string> = {
    standard: 'bg-slate-100 text-slate-600',
    cold:     'bg-blue-100 text-blue-700',
    hazmat:   'bg-red-100 text-red-700',
    oversize: 'bg-amber-100 text-amber-700',
};

export default function WarehouseBinShow({ bin }: Props) {
    const { can } = usePermission();

    const stockForm = useForm({
        product_id: '',
        quantity: '',
        lot_number: '',
        expiry_date: '',
    });

    function handleAddStock(e: React.FormEvent) {
        e.preventDefault();
        stockForm.post(`/inventory/warehouse-bins/${bin.id}/stock`, {
            preserveScroll: true,
            onSuccess: () => stockForm.reset(),
        });
    }

    function handleRemoveStock(location: BinStockLocation) {
        if (!confirm('Remove this stock location?')) return;
        router.delete(`/inventory/warehouse-bins/${bin.id}/stock/${location.id}`, { preserveScroll: true });
    }

    function handleDelete() {
        if (!confirm(`Delete bin "${bin.code}"?`)) return;
        router.delete(`/inventory/warehouse-bins/${bin.id}`);
    }

    const usedPct = bin.capacity != null && bin.capacity > 0
        ? Math.min(100, (bin.used_capacity / bin.capacity) * 100)
        : null;

    return (
        <AppLayout>
            <Head title={`Bin ${bin.code}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/inventory/warehouse-bins" className="text-sm text-slate-500 hover:text-slate-700">
                            ← Bin Locations
                        </Link>
                        <h1 className="text-2xl font-semibold text-slate-900 font-mono">{bin.code}</h1>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${binTypeColors[bin.bin_type] ?? ''}`}>
                            {bin.bin_type}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bin.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {bin.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    {can('inventory.delete') && (
                        <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Details */}
                    <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Details</h2>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt className="text-slate-500">Code</dt>
                                <dd className="font-mono font-medium text-slate-900">{bin.code}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Name</dt>
                                <dd className="font-medium text-slate-900">{bin.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Type</dt>
                                <dd className="font-medium text-slate-900">{bin.bin_type}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Zone</dt>
                                <dd className="font-medium text-slate-900">{bin.zone?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Warehouse</dt>
                                <dd className="font-medium text-slate-900">{bin.warehouse?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Created</dt>
                                <dd className="font-medium text-slate-900">{new Date(bin.created_at).toLocaleDateString()}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Capacity */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Capacity</h2>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Used</span>
                                <span className="font-medium text-slate-900">{bin.used_capacity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total</span>
                                <span className="font-medium text-slate-900">{bin.capacity ?? '∞'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Available</span>
                                <span className="font-medium text-slate-900">{bin.available_capacity ?? '∞'}</span>
                            </div>
                            {usedPct !== null && (
                                <div className="pt-2">
                                    <div className="h-2 rounded-full bg-slate-100">
                                        <div
                                            className={`h-2 rounded-full ${usedPct > 90 ? 'bg-red-500' : usedPct > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                                            style={{ width: `${usedPct}%` }}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500 text-right">{usedPct.toFixed(1)}% used</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stock Locations Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <h2 className="text-sm font-medium text-slate-700">Stock Locations</h2>
                    </div>
                    {bin.stock_locations && bin.stock_locations.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 uppercase border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Product</th>
                                    <th className="px-4 py-2 text-left font-medium">Quantity</th>
                                    <th className="px-4 py-2 text-left font-medium">Lot Number</th>
                                    <th className="px-4 py-2 text-left font-medium">Expiry Date</th>
                                    <th className="px-4 py-2 text-left font-medium">Status</th>
                                    {can('inventory.delete') && <th className="px-4 py-2" />}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {bin.stock_locations.map((loc) => (
                                    <tr key={loc.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 font-medium text-slate-900">
                                            {loc.product?.name ?? `Product #${loc.product_id}`}
                                        </td>
                                        <td className="px-4 py-2 text-slate-600">{loc.quantity}</td>
                                        <td className="px-4 py-2 text-slate-600">{loc.lot_number ?? '—'}</td>
                                        <td className="px-4 py-2 text-slate-600">{loc.expiry_date ?? '—'}</td>
                                        <td className="px-4 py-2">
                                            {loc.is_expired ? (
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                                    Expired
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                    OK
                                                </span>
                                            )}
                                        </td>
                                        {can('inventory.delete') && (
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => handleRemoveStock(loc)}
                                                    className="text-xs text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="px-4 py-6 text-sm text-slate-400 text-center">No stock in this bin.</p>
                    )}
                </div>

                {/* Add Stock Form */}
                {can('inventory.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Add Stock</h2>
                        <form onSubmit={handleAddStock} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product ID <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    value={stockForm.data.product_id}
                                    onChange={(e) => stockForm.setData('product_id', e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {stockForm.errors.product_id && <p className="mt-1 text-xs text-red-600">{stockForm.errors.product_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="0.0001"
                                    step="0.0001"
                                    value={stockForm.data.quantity}
                                    onChange={(e) => stockForm.setData('quantity', e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {stockForm.errors.quantity && <p className="mt-1 text-xs text-red-600">{stockForm.errors.quantity}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lot Number</label>
                                <input
                                    type="text"
                                    maxLength={50}
                                    value={stockForm.data.lot_number}
                                    onChange={(e) => stockForm.setData('lot_number', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {stockForm.errors.lot_number && <p className="mt-1 text-xs text-red-600">{stockForm.errors.lot_number}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    value={stockForm.data.expiry_date}
                                    onChange={(e) => stockForm.setData('expiry_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {stockForm.errors.expiry_date && <p className="mt-1 text-xs text-red-600">{stockForm.errors.expiry_date}</p>}
                            </div>
                            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                                <Button type="submit" disabled={stockForm.processing}>
                                    {stockForm.processing ? 'Adding…' : 'Add Stock'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

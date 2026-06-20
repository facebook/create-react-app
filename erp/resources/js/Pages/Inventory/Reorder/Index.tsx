import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';

interface ReorderSuggestion {
    id: number;
    sku: string;
    name: string;
    category: string | null;
    total_stock: number;
    reorder_point: number;
    reorder_quantity: number;
    preferred_supplier: string | null;
    preferred_supplier_id: number | null;
    cost_price: number;
}

interface Props extends PageProps {
    suggestions: ReorderSuggestion[];
    suppliers: { id: number; name: string }[];
    warehouses: { id: number; name: string }[];
}

export default function ReorderIndex({ suggestions, suppliers, warehouses }: Props) {
    const { can } = usePermission();

    const allSameSupplierId =
        suggestions.length > 0 &&
        suggestions.every((s) => s.preferred_supplier_id === suggestions[0].preferred_supplier_id) &&
        suggestions[0].preferred_supplier_id !== null
            ? suggestions[0].preferred_supplier_id
            : null;

    const { data, setData, post, processing, errors } = useForm<{
        supplier_id: string;
        warehouse_id: string;
        items: { product_id: number; quantity: number; unit_cost: number; selected: boolean }[];
    }>({
        supplier_id: String(allSameSupplierId ?? (suppliers[0]?.id ?? '')),
        warehouse_id: String(warehouses[0]?.id ?? ''),
        items: suggestions.map((s) => ({
            product_id: s.id,
            quantity: s.reorder_quantity,
            unit_cost: s.cost_price,
            selected: true,
        })),
    });

    function toggleItem(idx: number, selected: boolean) {
        const items = [...data.items];
        items[idx] = { ...items[idx], selected };
        setData('items', items);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const selectedItems = data.items
            .filter((item) => item.selected)
            .map(({ product_id, quantity, unit_cost }) => ({ product_id, quantity, unit_cost }));

        if (selectedItems.length === 0) return;

        (post as any)('/inventory/reorder/purchase-order', {
            data: {
                supplier_id: Number(data.supplier_id),
                warehouse_id: Number(data.warehouse_id),
                items: selectedItems,
            },
        });
    }

    const selectedCount = data.items.filter((i) => i.selected).length;

    return (
        <AppLayout>
            <Head title="Reorder Suggestions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-slate-900">Reorder Suggestions</h1>
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-700">
                            {suggestions.length} product{suggestions.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <Link href="/inventory/products" className="text-sm text-slate-500 hover:text-slate-700">
                        &larr; Products
                    </Link>
                </div>

                {suggestions.length === 0 ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-6 py-10 text-center">
                        <p className="text-green-800 font-medium text-lg">All stock levels are healthy</p>
                        <p className="text-green-600 text-sm mt-1">No products are currently below their reorder points.</p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <tr>
                                        {can('inventory.create') && (
                                            <th className="px-4 py-3 text-left w-8">
                                                <input
                                                    type="checkbox"
                                                    checked={data.items.every((i) => i.selected)}
                                                    onChange={(e) =>
                                                        setData('items', data.items.map((i) => ({ ...i, selected: e.target.checked })))
                                                    }
                                                    className="rounded border-slate-300"
                                                />
                                            </th>
                                        )}
                                        <th className="px-4 py-3 text-left font-medium">SKU</th>
                                        <th className="px-4 py-3 text-left font-medium">Product Name</th>
                                        <th className="px-4 py-3 text-left font-medium">Category</th>
                                        <th className="px-4 py-3 text-right font-medium">Current Stock</th>
                                        <th className="px-4 py-3 text-right font-medium">Reorder Point</th>
                                        <th className="px-4 py-3 text-right font-medium">Suggested Qty</th>
                                        <th className="px-4 py-3 text-left font-medium">Preferred Supplier</th>
                                        <th className="px-4 py-3 text-right font-medium">Cost/Unit</th>
                                        <th className="px-4 py-3 text-right font-medium">Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {suggestions.map((s, idx) => (
                                        <tr key={s.id} className={`hover:bg-slate-50 ${data.items[idx]?.selected ? '' : 'opacity-50'}`}>
                                            {can('inventory.create') && (
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.items[idx]?.selected ?? true}
                                                        onChange={(e) => toggleItem(idx, e.target.checked)}
                                                        className="rounded border-slate-300"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.sku}</td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/inventory/products/${s.id}`}
                                                    className="font-medium text-indigo-600 hover:text-indigo-800"
                                                >
                                                    {s.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{s.category ?? '—'}</td>
                                            <td className="px-4 py-3 text-right font-medium text-red-600">
                                                {s.total_stock.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                {s.reorder_point.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                {s.reorder_quantity.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {s.preferred_supplier ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                ${s.cost_price.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                ${(s.reorder_quantity * s.cost_price).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {can('inventory.create') && (
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                                <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
                                    Create Purchase Order
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Supplier
                                            </label>
                                            <select
                                                value={data.supplier_id}
                                                onChange={(e) => setData('supplier_id', e.target.value)}
                                                required
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">Select supplier&hellip;</option>
                                                {suppliers.map((s) => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                            {errors.supplier_id && (
                                                <p className="mt-1 text-xs text-red-600">{errors.supplier_id}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Warehouse
                                            </label>
                                            <select
                                                value={data.warehouse_id}
                                                onChange={(e) => setData('warehouse_id', e.target.value)}
                                                required
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">Select warehouse&hellip;</option>
                                                {warehouses.map((w) => (
                                                    <option key={w.id} value={w.id}>{w.name}</option>
                                                ))}
                                            </select>
                                            {errors.warehouse_id && (
                                                <p className="mt-1 text-xs text-red-600">{errors.warehouse_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                                        <span className="text-sm text-slate-600">
                                            {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
                                        </span>
                                        <Button
                                            type="submit"
                                            disabled={processing || selectedCount === 0}
                                        >
                                            {processing ? 'Creating…' : 'Create Draft PO'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}

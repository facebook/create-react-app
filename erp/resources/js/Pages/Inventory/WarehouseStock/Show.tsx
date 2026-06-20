import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string | null;
    unit: string | null;
}

interface Warehouse {
    id: number;
    name: string;
    location: string | null;
}

interface WarehouseStock {
    id: number;
    quantity: number;
    reserved_quantity: number | null;
    reorder_point: number | null;
    product: Product;
    warehouse: Warehouse;
    updated_at: string;
}

interface Props extends PageProps {
    warehouseStock: WarehouseStock;
}

export default function WarehouseStockShow({ warehouseStock }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        reorder_point: warehouseStock.reorder_point ?? '',
    });

    const stock = warehouseStock;
    const available = (stock.quantity ?? 0) - (stock.reserved_quantity ?? 0);
    const belowReorder =
        stock.reorder_point !== null && stock.quantity <= stock.reorder_point;

    function handleUpdateReorder(e: React.FormEvent) {
        e.preventDefault();
        put(`/inventory/warehouse-stock/${stock.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Stock — ${stock.product.name}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-500">
                            <Link href="/inventory/warehouse-stock" className="text-indigo-600 hover:underline">
                                Warehouse Stock
                            </Link>{' '}
                            &rsaquo; {stock.product.name}
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{stock.product.name}</h1>
                        {stock.product.sku && (
                            <p className="font-mono text-sm text-slate-500">SKU: {stock.product.sku}</p>
                        )}
                    </div>
                    {belowReorder && (
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            Below Reorder Point
                        </span>
                    )}
                </div>

                {/* Stock levels */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase text-slate-500">On Hand</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{stock.quantity}</p>
                        {stock.product.unit && (
                            <p className="text-xs text-slate-400">{stock.product.unit}</p>
                        )}
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase text-slate-500">Reserved</p>
                        <p className="mt-1 text-2xl font-bold text-orange-600">
                            {stock.reserved_quantity ?? 0}
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase text-slate-500">Available</p>
                        <p className={`mt-1 text-2xl font-bold ${available <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {available}
                        </p>
                    </div>
                    <div className={`rounded-lg border p-4 shadow-sm ${belowReorder ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                        <p className="text-xs font-medium uppercase text-slate-500">Reorder Point</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {stock.reorder_point ?? '—'}
                        </p>
                    </div>
                </div>

                {/* Warehouse & product info */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700">Location</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">Warehouse</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{stock.warehouse.name}</p>
                        </div>
                        {stock.warehouse.location && (
                            <div>
                                <p className="text-xs font-medium uppercase text-slate-500">Location</p>
                                <p className="mt-1 text-sm text-slate-700">{stock.warehouse.location}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">Last Updated</p>
                            <p className="mt-1 text-sm text-slate-700">
                                {new Date(stock.updated_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Update reorder point */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700">Reorder Settings</h2>
                    <form onSubmit={handleUpdateReorder} className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700">Reorder Point</label>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={data.reorder_point}
                                onChange={(e) => setData('reorder_point', e.target.value)}
                                placeholder="0"
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.reorder_point && (
                                <p className="mt-1 text-xs text-red-600">{errors.reorder_point}</p>
                            )}
                        </div>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Update'}
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

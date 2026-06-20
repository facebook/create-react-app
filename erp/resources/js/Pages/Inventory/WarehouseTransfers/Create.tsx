import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Product, Warehouse } from '@/types/inventory';

interface Props extends PageProps {
    products: Product[];
    warehouses: Warehouse[];
}

interface FormData {
    product_id: string;
    from_warehouse_id: string;
    to_warehouse_id: string;
    quantity: string;
    reference: string;
    notes: string;
    [key: string]: string;
}

export default function WarehouseTransferCreate({ products, warehouses }: Props) {
    const { errors } = usePage<Props>().props;
    const [form, setForm] = useState<FormData>({
        product_id: '',
        from_warehouse_id: '',
        to_warehouse_id: '',
        quantity: '',
        reference: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const sameWarehouseWarning =
        form.from_warehouse_id &&
        form.to_warehouse_id &&
        form.from_warehouse_id === form.to_warehouse_id;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (sameWarehouseWarning) return;
        setSubmitting(true);
        router.post('/inventory/warehouse-transfers', form, {
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AppLayout>
            <Head title="New Warehouse Transfer" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Warehouse Transfer</h1>
                    <p className="text-sm text-slate-500 mt-1">Move stock between warehouses</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Product */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Product <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.product_id}
                                onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
                                required
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">Select product</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.sku} — {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* From Warehouse */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                From Warehouse <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.from_warehouse_id}
                                onChange={(e) => setForm((f) => ({ ...f, from_warehouse_id: e.target.value }))}
                                required
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">Select source warehouse</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* To Warehouse */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                To Warehouse <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.to_warehouse_id}
                                onChange={(e) => setForm((f) => ({ ...f, to_warehouse_id: e.target.value }))}
                                required
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">Select destination warehouse</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                            {sameWarehouseWarning && (
                                <p className="mt-1 text-sm text-amber-600">
                                    Source and destination warehouses must be different.
                                </p>
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0.0001"
                                step="0.0001"
                                value={form.quantity}
                                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                                required
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors && (errors as Record<string, string>).quantity && (
                                <p className="mt-1 text-sm text-red-600">
                                    {(errors as Record<string, string>).quantity}
                                </p>
                            )}
                        </div>

                        {/* Reference */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                            <input
                                type="text"
                                value={form.reference}
                                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                                maxLength={100}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="e.g. TRF-001"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                rows={3}
                                maxLength={500}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex gap-3 border-t border-slate-200 pt-4">
                            <Button type="submit" loading={submitting} disabled={!!sameWarehouseWarning}>
                                Complete Transfer
                            </Button>
                            <a href="/inventory/warehouse-transfers">
                                <Button type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

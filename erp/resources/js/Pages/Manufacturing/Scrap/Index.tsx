import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface ManufacturingOrder {
    id: number;
    mo_number: string | null;
}

interface User {
    id: number;
    name: string;
}

interface ScrapOrder {
    id: number;
    product: Product | null;
    manufacturing_order: ManufacturingOrder | null;
    quantity: number;
    uom: string;
    reason: string | null;
    scrapped_by_user: User | null;
    scrapped_at: string | null;
}

interface Paginator<T> {
    data: T[];
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    scrapOrders: Paginator<ScrapOrder>;
    products: Product[];
    manufacturingOrders: ManufacturingOrder[];
    filters: { manufacturing_order_id?: string };
}

export default function ScrapIndex({ scrapOrders, products, manufacturingOrders }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        product_id: '',
        quantity: '',
        manufacturing_order_id: '',
        reason: '',
        uom: 'pcs',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        router.post('/manufacturing/scrap', form, {
            onError: (errs) => setErrors(errs),
            onSuccess: () => {
                setShowForm(false);
                setForm({ product_id: '', quantity: '', manufacturing_order_id: '', reason: '', uom: 'pcs' });
            },
        });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this scrap record?')) {
            router.delete(`/manufacturing/scrap/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Scrap Orders" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Scrap Orders</h1>
                        <p className="text-sm text-slate-500 mt-1">{scrapOrders.total} records</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>Record Scrap</Button>
                </div>

                {/* Record Scrap Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                        <h2 className="font-semibold text-slate-800">Record Scrap</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Product</label>
                                <select
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={form.product_id}
                                    onChange={e => setForm({ ...form, product_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                    ))}
                                </select>
                                {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="0.0001"
                                        step="0.01"
                                        className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
                                        value={form.quantity}
                                        onChange={e => setForm({ ...form, quantity: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="uom"
                                        className="w-20 rounded border border-slate-300 px-3 py-2 text-sm"
                                        value={form.uom}
                                        onChange={e => setForm({ ...form, uom: e.target.value })}
                                    />
                                </div>
                                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Manufacturing Order (optional)</label>
                                <select
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={form.manufacturing_order_id}
                                    onChange={e => setForm({ ...form, manufacturing_order_id: e.target.value })}
                                >
                                    <option value="">None</option>
                                    {manufacturingOrders.map(mo => (
                                        <option key={mo.id} value={mo.id}>{mo.mo_number ?? `#${mo.id}`}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
                                <input
                                    type="text"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={form.reason}
                                    onChange={e => setForm({ ...form, reason: e.target.value })}
                                    placeholder="Optional reason..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Record Scrap</Button>
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                    </form>
                )}

                {/* Scrap Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Qty</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">MO</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Reason</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Scrapped By</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {scrapOrders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">
                                            No scrap records yet.
                                        </td>
                                    </tr>
                                ) : scrapOrders.data.map(scrap => (
                                    <tr key={scrap.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-800">
                                            {scrap.product?.name ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {Number(scrap.quantity).toFixed(2)} {scrap.uom}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {scrap.manufacturing_order?.mo_number ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                                            {scrap.reason ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {scrap.scrapped_by_user?.name ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {scrap.scrapped_at ? new Date(scrap.scrapped_at).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(scrap.id)}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product { id: number; name: string; sku: string; }
interface Bom { id: number; name: string; product_id: number; }
interface Warehouse { id: number; name: string; }
interface User { id: number; name: string; }

interface MO {
    id: number;
    product_id: number;
    bom_id: number | null;
    qty_to_produce: number;
    scheduled_date: string | null;
    warehouse_id: number | null;
    origin: string | null;
    notes: string | null;
    responsible_id: number | null;
}

interface Props extends PageProps {
    order: MO;
    products: Product[];
    boms: Bom[];
    warehouses: Warehouse[];
    users: User[];
}

export default function ManufacturingOrderEdit({ order, products, boms, warehouses, users }: Props) {
    const [form, setForm] = useState({
        product_id: String(order.product_id),
        bom_id: order.bom_id ? String(order.bom_id) : '',
        qty_to_produce: String(order.qty_to_produce),
        scheduled_date: order.scheduled_date ?? '',
        warehouse_id: order.warehouse_id ? String(order.warehouse_id) : '',
        origin: order.origin ?? '',
        notes: order.notes ?? '',
        responsible_id: order.responsible_id ? String(order.responsible_id) : '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.put(`/manufacturing/manufacturing-orders/${order.id}`, form, {
            onError: (errs) => setErrors(errs),
        });
    }

    return (
        <AppLayout>
            <Head title="Edit Manufacturing Order" />
            <div className="max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">Edit Manufacturing Order</h1>
                <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Product *</label>
                            <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required>
                                <option value="">Select product...</option>
                                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                            </select>
                            {errors.product_id && <p className="mt-1 text-xs text-red-600">{errors.product_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">BOM</label>
                            <select value={form.bom_id} onChange={(e) => setForm({ ...form, bom_id: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                                <option value="">None</option>
                                {boms.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Qty to Produce *</label>
                            <input type="number" step="0.0001" min="0.0001" value={form.qty_to_produce}
                                onChange={(e) => setForm({ ...form, qty_to_produce: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Scheduled Date</label>
                            <input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Warehouse</label>
                            <select value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                                <option value="">None</option>
                                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Responsible</label>
                            <select value={form.responsible_id} onChange={(e) => setForm({ ...form, responsible_id: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                                <option value="">None</option>
                                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Origin</label>
                            <input type="text" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Notes</label>
                            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit">Update MO</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User { id: number; name: string }
interface Checklist { id: number; name: string }

interface OrderItem {
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}

interface Props extends PageProps {
    users: User[];
    checklists: Checklist[];
}

export default function CreateOrder({ users, checklists }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        type: string;
        priority: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        address: string;
        scheduled_at: string;
        assigned_to: string;
        estimated_duration: string;
        description: string;
        notes: string;
        items: OrderItem[];
    }>({
        title: '',
        type: 'repair',
        priority: 'medium',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        address: '',
        scheduled_at: '',
        assigned_to: '',
        estimated_duration: '',
        description: '',
        notes: '',
        items: [],
    });

    const addItem = () => {
        setData('items', [...data.items, { description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
        const updated = [...data.items];
        updated[index] = { ...updated[index], [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
            updated[index].line_total = updated[index].quantity * updated[index].unit_price;
        }
        setData('items', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/field-service/orders');
    };

    return (
        <AppLayout>
            <Head title="New Service Order" />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/field-service/orders" className="text-sm text-slate-500 hover:text-slate-700">&larr; Orders</Link>
                    <h1 className="text-2xl font-semibold text-slate-900">New Service Order</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-800">Order Details</h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Title *</label>
                                <input type="text" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Type *</label>
                                <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.type} onChange={(e) => setData('type', e.target.value)}>
                                    {['installation', 'repair', 'maintenance', 'inspection', 'other'].map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Priority *</label>
                                <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.priority} onChange={(e) => setData('priority', e.target.value)}>
                                    {['low', 'medium', 'high', 'urgent'].map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Assigned Technician</label>
                                <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.assigned_to} onChange={(e) => setData('assigned_to', e.target.value)}>
                                    <option value="">— Unassigned —</option>
                                    {users.map((u) => <option key={u.id} value={String(u.id)}>{u.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Scheduled At</label>
                                <input type="datetime-local" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.scheduled_at} onChange={(e) => setData('scheduled_at', e.target.value)} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Estimated Duration (minutes)</label>
                                <input type="number" min="0" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.estimated_duration} onChange={(e) => setData('estimated_duration', e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea rows={3} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-800">Customer Information</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Customer Name</label>
                                <input type="text" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Customer Email</label>
                                <input type="email" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.customer_email} onChange={(e) => setData('customer_email', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Customer Phone</label>
                                <input type="text" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.customer_phone} onChange={(e) => setData('customer_phone', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Address</label>
                            <textarea rows={2} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-800">Order Items</h2>
                            <button type="button" onClick={addItem} className="text-sm text-indigo-600 hover:text-indigo-800">+ Add Item</button>
                        </div>

                        {data.items.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="text-left text-xs font-medium uppercase text-slate-500">
                                            <th className="pb-2 pr-4">Description</th>
                                            <th className="pb-2 pr-4 w-24">Qty</th>
                                            <th className="pb-2 pr-4 w-28">Unit Price</th>
                                            <th className="pb-2 pr-4 w-28">Total</th>
                                            <th className="pb-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.items.map((item, i) => (
                                            <tr key={i}>
                                                <td className="py-2 pr-4">
                                                    <input type="text" className="w-full rounded border border-slate-300 px-2 py-1 text-sm" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="Item description" />
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <input type="number" min="0" step="0.01" className="w-full rounded border border-slate-300 px-2 py-1 text-sm" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} />
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <input type="number" min="0" step="0.01" className="w-full rounded border border-slate-300 px-2 py-1 text-sm" value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)} />
                                                </td>
                                                <td className="py-2 pr-4 text-sm text-slate-700">${item.line_total.toFixed(2)}</td>
                                                <td className="py-2">
                                                    <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="pt-3 text-right text-sm font-medium text-slate-700">Total:</td>
                                            <td className="pt-3 text-sm font-semibold text-slate-900">
                                                ${data.items.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        {data.items.length === 0 && (
                            <p className="text-sm text-slate-400">No items added yet.</p>
                        )}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea rows={3} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>Create Order</Button>
                        <Link href="/field-service/orders"><Button type="button" variant="secondary">Cancel</Button></Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface EquipmentRef {
    id: number;
    name: string;
}

interface UserRef {
    id: number;
    name: string;
}

interface OrderItem {
    id: number;
    order_number: string;
    title: string;
    equipment: EquipmentRef | null;
    type: string;
    priority: string;
    status: string;
    scheduled_date: string | null;
    assigned_user: UserRef | null;
}

interface PaginatedOrders {
    data: OrderItem[];
    current_page: number;
    last_page: number;
}

interface Props extends PageProps {
    orders: PaginatedOrders;
}

const typeColors: Record<string, string> = {
    preventive:  'bg-blue-100 text-blue-700',
    corrective:  'bg-orange-100 text-orange-700',
    emergency:   'bg-red-100 text-red-700',
};

const priorityColors: Record<string, string> = {
    low:      'bg-slate-100 text-slate-700',
    medium:   'bg-yellow-100 text-yellow-700',
    high:     'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
    open:        'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed:   'bg-green-100 text-green-700',
    cancelled:   'bg-gray-100 text-gray-600',
};

export default function OrdersIndex({ orders }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [completingId, setCompletingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        equipment_id: '',
        type: 'preventive',
        priority: 'medium',
        title: '',
        description: '',
        scheduled_date: '',
        estimated_hours: '',
    });

    const completeForm = useForm({
        resolution: '',
        actual_hours: '',
        cost: '',
    });

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        post('/maintenance/orders', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    function startOrder(id: number) {
        router.post(`/maintenance/orders/${id}/start`);
    }

    function submitComplete(e: React.FormEvent, id: number) {
        e.preventDefault();
        completeForm.post(`/maintenance/orders/${id}/complete`, {
            onSuccess: () => { completeForm.reset(); setCompletingId(null); },
        });
    }

    return (
        <AppLayout>
            <Head title="Maintenance Orders" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Maintenance Orders</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        {showForm ? 'Cancel' : 'New Order'}
                    </button>
                </div>

                {showForm && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-800">Create Maintenance Order</h2>
                        <form onSubmit={submitCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Equipment ID *</label>
                                <input
                                    type="number"
                                    value={data.equipment_id}
                                    onChange={e => setData('equipment_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                                {errors.equipment_id && <p className="mt-1 text-xs text-red-600">{errors.equipment_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Title *</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Type *</label>
                                <select
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="preventive">Preventive</option>
                                    <option value="corrective">Corrective</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Priority *</label>
                                <select
                                    value={data.priority}
                                    onChange={e => setData('priority', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Scheduled Date</label>
                                <input
                                    type="date"
                                    value={data.scheduled_date}
                                    onChange={e => setData('scheduled_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Estimated Hours</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={data.estimated_hours}
                                    onChange={e => setData('estimated_hours', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { reset(); setShowForm(false); }}
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Order #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Equipment</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Priority</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Scheduled</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Assigned To</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.data.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">No orders found.</td>
                                    </tr>
                                )}
                                {orders.data.map((order) => (
                                    <>
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm font-mono text-slate-700">{order.order_number}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{order.title}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{order.equipment?.name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${typeColors[order.type] ?? typeColors.preventive}`}>
                                                    {order.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[order.priority] ?? priorityColors.medium}`}>
                                                    {order.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] ?? statusColors.open}`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{order.scheduled_date ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{order.assigned_user?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex gap-2">
                                                    {order.status === 'open' && (
                                                        <button
                                                            onClick={() => startOrder(order.id)}
                                                            className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                                                        >
                                                            Start
                                                        </button>
                                                    )}
                                                    {order.status === 'in_progress' && (
                                                        <button
                                                            onClick={() => setCompletingId(completingId === order.id ? null : order.id)}
                                                            className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {completingId === order.id && (
                                            <tr key={`complete-${order.id}`}>
                                                <td colSpan={9} className="bg-green-50 px-6 py-4">
                                                    <form onSubmit={(e) => submitComplete(e, order.id)} className="flex flex-wrap gap-3 items-end">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-700">Resolution *</label>
                                                            <input
                                                                type="text"
                                                                value={completeForm.data.resolution}
                                                                onChange={e => completeForm.setData('resolution', e.target.value)}
                                                                className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-700">Actual Hours *</label>
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                value={completeForm.data.actual_hours}
                                                                onChange={e => completeForm.setData('actual_hours', e.target.value)}
                                                                className="mt-1 w-28 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-700">Cost</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={completeForm.data.cost}
                                                                onChange={e => completeForm.setData('cost', e.target.value)}
                                                                className="mt-1 w-28 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                                            />
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            disabled={completeForm.processing}
                                                            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            {completeForm.processing ? 'Saving...' : 'Mark Complete'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCompletingId(null)}
                                                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </form>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

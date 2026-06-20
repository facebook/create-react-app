import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface ProductRef {
    id: number;
    name: string;
}

interface RepairLine {
    id: number;
    line_type: string;
    description: string;
    quantity: string;
    unit_price: string;
    total: string;
    product: ProductRef | null;
    is_invoiced: boolean;
}

interface UserRef {
    id: number;
    name: string;
}

interface ContactRef {
    id: number;
    name: string;
}

interface RepairOrder {
    id: number;
    order_number: string;
    product_name: string;
    serial_number: string | null;
    status: string;
    priority: string;
    diagnosis: string | null;
    internal_notes: string | null;
    warranty_claim: boolean;
    scheduled_date: string | null;
    started_at: string | null;
    completed_at: string | null;
    estimated_hours: string | null;
    actual_hours: string | null;
    estimated_cost: string | null;
    final_cost: string | null;
    assigned_user: UserRef | null;
    contact: ContactRef | null;
    lines: RepairLine[];
}

interface Props extends PageProps {
    order: RepairOrder;
}

const statusColors: Record<string, string> = {
    draft:       'bg-gray-100 text-gray-700',
    confirmed:   'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    done:        'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-700',
};

const priorityColors: Record<string, string> = {
    low:    'bg-slate-100 text-slate-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

export default function RepairOrderShow({ order }: Props) {
    const [showAddLine, setShowAddLine] = useState(false);

    const lineForm = useForm({
        line_type:   'part',
        description: '',
        quantity:    '1',
        unit_price:  '0',
        product_id:  '',
    });

    const completeForm = useForm({
        actual_hours: '',
    });

    function submitLine(e: React.FormEvent) {
        e.preventDefault();
        lineForm.post(`/repairs/orders/${order.id}/lines`, {
            onSuccess: () => { lineForm.reset(); setShowAddLine(false); },
        });
    }

    function removeLine(lineId: number) {
        router.delete(`/repairs/lines/${lineId}`);
    }

    function confirmOrder() {
        router.post(`/repairs/orders/${order.id}/confirm`);
    }

    function startOrder() {
        router.post(`/repairs/orders/${order.id}/start`);
    }

    function submitComplete(e: React.FormEvent) {
        e.preventDefault();
        completeForm.post(`/repairs/orders/${order.id}/complete`);
    }

    function cancelOrder() {
        router.post(`/repairs/orders/${order.id}/cancel`);
    }

    const totalParts = order.lines
        .filter(l => l.line_type === 'part')
        .reduce((sum, l) => sum + parseFloat(l.total), 0);

    const totalLabor = order.lines
        .filter(l => l.line_type === 'labor')
        .reduce((sum, l) => sum + parseFloat(l.total), 0);

    return (
        <AppLayout>
            <Head title={`Repair ${order.order_number}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{order.order_number}</h1>
                        <p className="mt-1 text-sm text-slate-500">{order.product_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {order.status === 'draft' && (
                            <button
                                onClick={confirmOrder}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Confirm
                            </button>
                        )}
                        {order.status === 'confirmed' && (
                            <button
                                onClick={startOrder}
                                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                            >
                                Start Repair
                            </button>
                        )}
                        {!['done', 'cancelled'].includes(order.status) && (
                            <button
                                onClick={cancelOrder}
                                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Left column - repair details */}
                    <div className="space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-base font-semibold text-slate-800">Repair Details</h2>
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-slate-500">Status</dt>
                                    <dd>
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] ?? statusColors.draft}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-slate-500">Priority</dt>
                                    <dd>
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[order.priority] ?? priorityColors.low}`}>
                                            {order.priority}
                                        </span>
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-slate-500">Product</dt>
                                    <dd className="text-sm text-slate-900">{order.product_name}</dd>
                                </div>
                                {order.serial_number && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-slate-500">Serial Number</dt>
                                        <dd className="text-sm font-mono text-slate-900">{order.serial_number}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt className="text-sm text-slate-500">Warranty Claim</dt>
                                    <dd>
                                        {order.warranty_claim
                                            ? <span className="inline-block rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">Yes</span>
                                            : <span className="text-sm text-slate-400">No</span>
                                        }
                                    </dd>
                                </div>
                                {order.contact && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-slate-500">Contact</dt>
                                        <dd className="text-sm text-slate-900">{order.contact.name}</dd>
                                    </div>
                                )}
                                {order.assigned_user && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-slate-500">Assigned To</dt>
                                        <dd className="text-sm text-slate-900">{order.assigned_user.name}</dd>
                                    </div>
                                )}
                                {order.scheduled_date && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-slate-500">Scheduled Date</dt>
                                        <dd className="text-sm text-slate-900">{order.scheduled_date}</dd>
                                    </div>
                                )}
                                {order.started_at && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-slate-500">Started</dt>
                                        <dd className="text-sm text-slate-900">{order.started_at}</dd>
                                    </div>
                                )}
                                {order.completed_at && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-slate-500">Completed</dt>
                                        <dd className="text-sm text-slate-900">{order.completed_at}</dd>
                                    </div>
                                )}
                                {order.estimated_hours && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-slate-500">Est. Hours</dt>
                                        <dd className="text-sm text-slate-900">{order.estimated_hours}h</dd>
                                    </div>
                                )}
                                {order.actual_hours && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-slate-500">Actual Hours</dt>
                                        <dd className="text-sm text-slate-900">{order.actual_hours}h</dd>
                                    </div>
                                )}
                                {order.estimated_cost && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-slate-500">Est. Cost</dt>
                                        <dd className="text-sm text-slate-900">${parseFloat(order.estimated_cost).toFixed(2)}</dd>
                                    </div>
                                )}
                                {order.final_cost && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-slate-700">Final Cost</dt>
                                        <dd className="text-sm font-semibold text-slate-900">${parseFloat(order.final_cost).toFixed(2)}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {order.diagnosis && (
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-2 text-sm font-semibold text-slate-700">Diagnosis</h3>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{order.diagnosis}</p>
                            </div>
                        )}

                        {order.internal_notes && (
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-2 text-sm font-semibold text-slate-700">Internal Notes</h3>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{order.internal_notes}</p>
                            </div>
                        )}

                        {order.status === 'in_progress' && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                                <h3 className="mb-4 text-sm font-semibold text-green-800">Complete Repair</h3>
                                <form onSubmit={submitComplete} className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Actual Hours</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={completeForm.data.actual_hours}
                                            onChange={e => completeForm.setData('actual_hours', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={completeForm.processing}
                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {completeForm.processing ? 'Completing...' : 'Mark Complete'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Right column - repair lines */}
                    <div className="space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                                <h2 className="text-base font-semibold text-slate-800">Repair Lines</h2>
                                {!['done', 'cancelled'].includes(order.status) && (
                                    <button
                                        onClick={() => setShowAddLine(!showAddLine)}
                                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        {showAddLine ? 'Cancel' : 'Add Line'}
                                    </button>
                                )}
                            </div>

                            {showAddLine && (
                                <div className="border-b border-slate-200 p-6 bg-slate-50">
                                    <form onSubmit={submitLine} className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Type</label>
                                            <select
                                                value={lineForm.data.line_type}
                                                onChange={e => lineForm.setData('line_type', e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                            >
                                                <option value="part">Part</option>
                                                <option value="labor">Labor</option>
                                                <option value="service">Service</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Description *</label>
                                            <input
                                                type="text"
                                                value={lineForm.data.description}
                                                onChange={e => lineForm.setData('description', e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                            />
                                            {lineForm.errors.description && <p className="mt-1 text-xs text-red-600">{lineForm.errors.description}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Quantity *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={lineForm.data.quantity}
                                                onChange={e => lineForm.setData('quantity', e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Unit Price *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={lineForm.data.unit_price}
                                                onChange={e => lineForm.setData('unit_price', e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => { lineForm.reset(); setShowAddLine(false); }}
                                                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={lineForm.processing}
                                                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {lineForm.processing ? 'Adding...' : 'Add Line'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Qty</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Unit Price</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Total</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {order.lines.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">No lines added yet.</td>
                                            </tr>
                                        )}
                                        {order.lines.map((line) => (
                                            <tr key={line.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 capitalize">
                                                        {line.line_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-900">{line.description}</td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-600">{line.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-600">${parseFloat(line.unit_price).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">${parseFloat(line.total).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {!['done', 'cancelled'].includes(order.status) && !line.is_invoiced && (
                                                        <button
                                                            onClick={() => removeLine(line.id)}
                                                            className="text-xs text-red-600 hover:text-red-800"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {order.lines.length > 0 && (
                                        <tfoot className="bg-slate-50 border-t border-slate-200">
                                            <tr>
                                                <td colSpan={4} className="px-4 py-2 text-xs text-right text-slate-500">Parts subtotal</td>
                                                <td className="px-4 py-2 text-sm text-right font-medium text-slate-700">${totalParts.toFixed(2)}</td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td colSpan={4} className="px-4 py-2 text-xs text-right text-slate-500">Labor subtotal</td>
                                                <td className="px-4 py-2 text-sm text-right font-medium text-slate-700">${totalLabor.toFixed(2)}</td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td colSpan={4} className="px-4 py-2 text-sm text-right font-semibold text-slate-800">
                                                    {order.final_cost ? 'Final Cost' : 'Estimated Total'}
                                                </td>
                                                <td className="px-4 py-2 text-base text-right font-bold text-slate-900">
                                                    ${order.final_cost
                                                        ? parseFloat(order.final_cost).toFixed(2)
                                                        : (totalParts + totalLabor).toFixed(2)
                                                    }
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

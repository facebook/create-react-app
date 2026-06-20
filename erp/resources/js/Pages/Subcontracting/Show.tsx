import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Badge } from '@/Components/Common/Badge';
import type { PageProps } from '@/types';

interface SubcontractComponent {
    id: number;
    component_name: string;
    quantity: number;
    unit: string;
}

interface SubcontractOrder {
    id: number;
    reference: string;
    vendor_id: number | null;
    finished_product: string;
    finished_qty: number;
    unit_price: number;
    status: 'draft' | 'sent' | 'in_progress' | 'received' | 'cancelled';
    notes: string | null;
    sent_at: string | null;
    received_at: string | null;
    components: SubcontractComponent[];
}

interface Props extends PageProps {
    order: SubcontractOrder;
}

const STATUS_COLORS: Record<string, 'gray' | 'blue' | 'yellow' | 'green' | 'red'> = {
    draft:       'gray',
    sent:        'blue',
    in_progress: 'yellow',
    received:    'green',
    cancelled:   'red',
};

const STATUS_LABELS: Record<string, string> = {
    draft:       'Draft',
    sent:        'Sent',
    in_progress: 'In Progress',
    received:    'Received',
    cancelled:   'Cancelled',
};

export default function SubcontractingShow({ order }: Props) {
    const [showComponentForm, setShowComponentForm] = useState(false);
    const [compForm, setCompForm] = useState({
        component_name: '',
        quantity: '',
        unit: 'pcs',
    });

    const totalCost = (order.unit_price * order.finished_qty).toFixed(2);

    function handleAction(routeName: string) {
        router.post(route(routeName, order.id));
    }

    function handleAddComponent(e: React.FormEvent) {
        e.preventDefault();
        router.post(route('subcontracting.orders.components.store', order.id), {
            component_name: compForm.component_name,
            quantity:       compForm.quantity,
            unit:           compForm.unit || undefined,
        }, {
            onSuccess: () => {
                setShowComponentForm(false);
                setCompForm({ component_name: '', quantity: '', unit: 'pcs' });
            },
        });
    }

    function handleRemoveComponent(componentId: number) {
        if (!confirm('Remove this component?')) return;
        router.delete(route('subcontracting.orders.components.destroy', { order: order.id, component: componentId }));
    }

    function handleCompChange(e: React.ChangeEvent<HTMLInputElement>) {
        setCompForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const isDraft       = order.status === 'draft';
    const isSent        = order.status === 'sent';
    const isInProgress  = order.status === 'in_progress';
    const isTerminal    = order.status === 'received' || order.status === 'cancelled';

    return (
        <AppLayout>
            <Head title={`Subcontract ${order.reference}`} />
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/subcontracting/orders" className="text-sm text-slate-500 hover:text-slate-700">
                                Subcontracting
                            </Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-sm text-slate-700 font-medium">{order.reference}</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-900">{order.reference}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <Badge color={STATUS_COLORS[order.status] ?? 'gray'}>
                                {STATUS_LABELS[order.status] ?? order.status}
                            </Badge>
                            {order.sent_at && (
                                <span className="text-sm text-slate-500">Sent: {order.sent_at}</span>
                            )}
                            {order.received_at && (
                                <span className="text-sm text-slate-500">Received: {order.received_at}</span>
                            )}
                            <span className="text-sm font-medium text-slate-700">Total Cost: {totalCost}</span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 justify-end">
                        {isDraft && (
                            <Button onClick={() => handleAction('subcontracting.orders.send')}>
                                Send to Vendor
                            </Button>
                        )}
                        {isSent && (
                            <Button onClick={() => handleAction('subcontracting.orders.start-production')}>
                                Start Production
                            </Button>
                        )}
                        {isInProgress && (
                            <Button onClick={() => handleAction('subcontracting.orders.receive')}>
                                Receive Goods
                            </Button>
                        )}
                        {!isTerminal && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    if (confirm('Cancel this order?')) {
                                        handleAction('subcontracting.orders.cancel');
                                    }
                                }}
                            >
                                Cancel Order
                            </Button>
                        )}
                    </div>
                </div>

                {/* Order details */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Finished Product</p>
                        <p className="font-medium text-slate-900">{order.finished_product}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Quantity</p>
                        <p className="font-medium text-slate-900">{Number(order.finished_qty).toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Unit Price</p>
                        <p className="font-medium text-slate-900">{Number(order.unit_price).toFixed(2)}</p>
                    </div>
                </div>

                {/* Components */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                        <h2 className="text-base font-semibold text-slate-900">Components</h2>
                        {isDraft && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowComponentForm(v => !v)}
                            >
                                {showComponentForm ? 'Cancel' : 'Add Component'}
                            </Button>
                        )}
                    </div>

                    {/* Add component inline form */}
                    {showComponentForm && isDraft && (
                        <div className="border-b border-slate-200 px-4 py-4 bg-slate-50">
                            <form onSubmit={handleAddComponent} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Component Name *</label>
                                    <input
                                        name="component_name"
                                        value={compForm.component_name}
                                        onChange={handleCompChange}
                                        required
                                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Steel Rod"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Quantity *</label>
                                    <input
                                        name="quantity"
                                        type="number"
                                        step="0.0001"
                                        min="0.0001"
                                        value={compForm.quantity}
                                        onChange={handleCompChange}
                                        required
                                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Unit</label>
                                    <input
                                        name="unit"
                                        value={compForm.unit}
                                        onChange={handleCompChange}
                                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="pcs"
                                    />
                                </div>
                                <div className="sm:col-span-4 flex justify-end gap-2">
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setShowComponentForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="sm">Add</Button>
                                </div>
                            </form>
                        </div>
                    )}

                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Component</th>
                                <th className="px-4 py-2 text-right font-medium">Quantity</th>
                                <th className="px-4 py-2 text-left font-medium">Unit</th>
                                {isDraft && <th className="px-4 py-2 text-right font-medium"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(order.components ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan={isDraft ? 4 : 3} className="px-4 py-6 text-center text-slate-400">
                                        No components added yet.
                                    </td>
                                </tr>
                            ) : (
                                (order.components ?? []).map((comp) => (
                                    <tr key={comp.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-700">{comp.component_name}</td>
                                        <td className="px-4 py-3 text-right text-slate-700">{Number(comp.quantity).toFixed(4)}</td>
                                        <td className="px-4 py-3 text-slate-500">{comp.unit}</td>
                                        {isDraft && (
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveComponent(comp.id)}
                                                    className="text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{order.notes}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

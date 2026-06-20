import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface OrderItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}

interface ChecklistResult {
    id: number;
    checklist_item_id: number;
    is_checked: boolean;
    notes: string | null;
    checklist_item: { id: number; label: string; sequence: number };
}

interface Order {
    id: number;
    order_number: string | null;
    title: string;
    description: string | null;
    type: string;
    priority: string;
    status: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    address: string | null;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    estimated_duration: number | null;
    actual_duration: number | null;
    notes: string | null;
    technician: { id: number; name: string } | null;
    items: OrderItem[];
    checklist_results: ChecklistResult[];
}

interface Props extends PageProps {
    order: Order;
}

const priorityColors: Record<string, string> = {
    low:    'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
    pending:     'bg-yellow-100 text-yellow-700',
    assigned:    'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    on_hold:     'bg-slate-100 text-slate-700',
    completed:   'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-700',
};

export default function ShowOrder({ order }: Props) {
    const total = order.items.reduce((sum, item) => sum + item.line_total, 0);

    const canStart    = ['pending', 'assigned'].includes(order.status);
    const canComplete = order.status === 'in_progress';
    const canCancel   = !['completed', 'cancelled'].includes(order.status);

    const doAction = (action: string) => {
        router.post(`/field-service/orders/${order.id}/${action}`);
    };

    return (
        <AppLayout>
            <Head title={`Order ${order.order_number ?? order.id}`} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/field-service/orders" className="text-sm text-slate-500 hover:text-slate-700">&larr; Orders</Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold text-slate-900">{order.order_number ?? `Order #${order.id}`}</h1>
                                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] ?? statusColors.pending}`}>
                                    {order.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="mt-1 text-slate-600">{order.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canStart    && <Button size="sm" onClick={() => doAction('start')}>Start</Button>}
                        {canComplete && <Button size="sm" onClick={() => doAction('complete')}>Complete</Button>}
                        {canCancel   && <Button size="sm" variant="danger" onClick={() => doAction('cancel')}>Cancel</Button>}
                        <Link href={`/field-service/orders/${order.id}/edit`}><Button size="sm" variant="secondary">Edit</Button></Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-base font-semibold text-slate-800">Order Details</h2>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Type</dt>
                                    <dd className="mt-1 text-sm capitalize text-slate-800">{order.type}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Priority</dt>
                                    <dd className="mt-1">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[order.priority] ?? priorityColors.medium}`}>
                                            {order.priority}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Scheduled At</dt>
                                    <dd className="mt-1 text-sm text-slate-800">{order.scheduled_at ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Technician</dt>
                                    <dd className="mt-1 text-sm text-slate-800">{order.technician?.name ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Estimated Duration</dt>
                                    <dd className="mt-1 text-sm text-slate-800">{order.estimated_duration ? `${order.estimated_duration} min` : '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Actual Duration</dt>
                                    <dd className="mt-1 text-sm text-slate-800">{order.actual_duration ? `${order.actual_duration} min` : '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Started At</dt>
                                    <dd className="mt-1 text-sm text-slate-800">{order.started_at ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Completed At</dt>
                                    <dd className="mt-1 text-sm text-slate-800">{order.completed_at ?? '—'}</dd>
                                </div>
                            </dl>
                            {order.description && (
                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    <dt className="text-xs font-medium uppercase text-slate-500">Description</dt>
                                    <dd className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{order.description}</dd>
                                </div>
                            )}
                        </div>

                        {/* Items Table */}
                        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h2 className="text-base font-semibold text-slate-800">Order Items</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Qty</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Unit Price</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {order.items.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">No items</td>
                                            </tr>
                                        )}
                                        {order.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-sm text-slate-800">{item.description}</td>
                                                <td className="px-4 py-3 text-right text-sm text-slate-700">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-sm text-slate-700">${item.unit_price.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">${item.line_total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {order.items.length > 0 && (
                                        <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Total Amount</td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">${total.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>

                        {/* Checklist Results */}
                        {order.checklist_results.length > 0 && (
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-base font-semibold text-slate-800">Checklist</h2>
                                <ul className="space-y-2">
                                    {order.checklist_results.map((result) => (
                                        <li key={result.id} className="flex items-start gap-3">
                                            <span className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border ${result.is_checked ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                                                {result.is_checked && (
                                                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </span>
                                            <div>
                                                <p className="text-sm text-slate-800">{result.checklist_item.label}</p>
                                                {result.notes && <p className="text-xs text-slate-500">{result.notes}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Customer Info Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-base font-semibold text-slate-800">Customer</h2>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Name</dt>
                                    <dd className="mt-1 text-sm text-slate-800">{order.customer_name ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Email</dt>
                                    <dd className="mt-1 text-sm text-slate-800">{order.customer_email ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Phone</dt>
                                    <dd className="mt-1 text-sm text-slate-800">{order.customer_phone ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Address</dt>
                                    <dd className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{order.address ?? '—'}</dd>
                                </div>
                            </dl>
                        </div>

                        {order.notes && (
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-2 text-base font-semibold text-slate-800">Notes</h2>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{order.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

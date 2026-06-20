import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product { id: number; name: string; sku: string; }
interface Bom { id: number; name: string; }
interface Warehouse { id: number; name: string; }
interface User { id: number; name: string; }
interface WorkCenter { id: number; name: string; }

interface MoComponent {
    id: number;
    product: Product;
    qty_required: number;
    qty_consumed: number;
    remaining_qty: number;
    uom: string | null;
    is_available: boolean;
}

interface WorkOrder {
    id: number;
    operation_name: string;
    work_center: WorkCenter | null;
    sequence: number;
    duration_expected: number;
    duration_label: string;
    status: string;
    actual_start: string | null;
    actual_finish: string | null;
}

interface MO {
    id: number;
    mo_number: string | null;
    product: Product;
    bom: Bom | null;
    qty_to_produce: number;
    qty_produced: number;
    progress_percentage: number;
    status: string;
    scheduled_date: string | null;
    start_date: string | null;
    finish_date: string | null;
    origin: string | null;
    notes: string | null;
    warehouse: Warehouse | null;
    responsible: User | null;
    components: MoComponent[];
    work_orders: WorkOrder[];
}

interface Props extends PageProps {
    order: MO;
}

const statusBadge: Record<string, string> = {
    draft:       'bg-slate-100 text-slate-800',
    confirmed:   'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    done:        'bg-green-100 text-green-800',
    cancelled:   'bg-red-100 text-red-800',
};

const woBadge: Record<string, string> = {
    pending:     'bg-slate-100 text-slate-600',
    in_progress: 'bg-yellow-100 text-yellow-800',
    done:        'bg-green-100 text-green-800',
    cancelled:   'bg-red-100 text-red-800',
};

export default function ManufacturingOrderShow({ order }: Props) {
    function handleAction(action: string) {
        router.post(`/manufacturing/manufacturing-orders/${order.id}/${action}`);
    }

    function handleWoAction(woId: number, action: string) {
        router.post(`/manufacturing/manufacturing-orders/${order.id}/work-orders/${woId}/${action}`);
    }

    return (
        <AppLayout>
            <Head title={`MO: ${order.mo_number ?? `#${order.id}`}`} />
            <div className="max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-slate-900">{order.mo_number ?? `MO #${order.id}`}</h1>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[order.status] ?? 'bg-slate-100 text-slate-800'}`}>
                            {order.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {order.status === 'draft' && (
                            <Button size="sm" onClick={() => handleAction('confirm')}>Confirm</Button>
                        )}
                        {order.status === 'confirmed' && (
                            <Button size="sm" onClick={() => handleAction('start')}>Start Production</Button>
                        )}
                        {order.status === 'in_progress' && (
                            <Button size="sm" onClick={() => handleAction('complete')}>Complete</Button>
                        )}
                        {['draft', 'confirmed'].includes(order.status) && (
                            <Button size="sm" variant="secondary" onClick={() => handleAction('cancel')}>Cancel</Button>
                        )}
                        <Link href={`/manufacturing/manufacturing-orders/${order.id}/edit`}>
                            <Button size="sm" variant="secondary">Edit</Button>
                        </Link>
                        <Link href="/manufacturing/manufacturing-orders">
                            <Button size="sm" variant="secondary">Back</Button>
                        </Link>
                    </div>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Product</dt>
                            <dd className="mt-1 text-sm text-slate-900">{order.product.name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">BOM</dt>
                            <dd className="mt-1 text-sm text-slate-900">{order.bom?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Scheduled Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{order.scheduled_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Start Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{order.start_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Finish Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{order.finish_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Origin</dt>
                            <dd className="mt-1 text-sm text-slate-900">{order.origin ?? '—'}</dd>
                        </div>
                        {order.warehouse && (
                            <div>
                                <dt className="text-xs font-medium uppercase text-slate-500">Warehouse</dt>
                                <dd className="mt-1 text-sm text-slate-900">{order.warehouse.name}</dd>
                            </div>
                        )}
                        {order.responsible && (
                            <div>
                                <dt className="text-xs font-medium uppercase text-slate-500">Responsible</dt>
                                <dd className="mt-1 text-sm text-slate-900">{order.responsible.name}</dd>
                            </div>
                        )}
                        <div className="col-span-3">
                            <dt className="text-xs font-medium uppercase text-slate-500 mb-1">Production Progress</dt>
                            <dd className="flex items-center gap-3">
                                <div className="flex-1 rounded-full bg-slate-200 h-2">
                                    <div className="rounded-full bg-indigo-500 h-2 transition-all" style={{ width: `${Math.min(order.progress_percentage, 100)}%` }} />
                                </div>
                                <span className="text-sm text-slate-700">{order.qty_produced} / {order.qty_to_produce} ({order.progress_percentage}%)</span>
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Components */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-slate-800">Components ({order.components.length})</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Component</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Required</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Consumed</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Remaining</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">UOM</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Available</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {order.components.map((c) => (
                                <tr key={c.id}>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.product.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.qty_required}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.qty_consumed}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.remaining_qty}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.uom ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {c.is_available ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {order.components.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">No components.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Work Orders */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-slate-800">Work Orders ({order.work_orders.length})</h2>
                        <Link href={`/manufacturing/manufacturing-orders/${order.id}/work-orders/create`}>
                            <Button size="sm">Add Work Order</Button>
                        </Link>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Seq</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Operation</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Work Center</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Expected</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actual Start</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actual Finish</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {order.work_orders.map((wo) => (
                                <tr key={wo.id}>
                                    <td className="px-4 py-3 text-sm text-slate-600">{wo.sequence}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{wo.operation_name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{wo.work_center?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{wo.duration_label}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${woBadge[wo.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {wo.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{wo.actual_start ? new Date(wo.actual_start).toLocaleString() : '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{wo.actual_finish ? new Date(wo.actual_finish).toLocaleString() : '—'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex flex-wrap gap-1">
                                            {wo.status === 'pending' && (
                                                <button onClick={() => handleWoAction(wo.id, 'start')} className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 hover:bg-yellow-200">Start</button>
                                            )}
                                            {wo.status === 'in_progress' && (
                                                <button onClick={() => handleWoAction(wo.id, 'finish')} className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 hover:bg-green-200">Finish</button>
                                            )}
                                            {['pending', 'in_progress'].includes(wo.status) && (
                                                <button onClick={() => handleWoAction(wo.id, 'cancel')} className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600 hover:bg-red-100">Cancel</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {order.work_orders.length === 0 && (
                                <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-500">No work orders yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

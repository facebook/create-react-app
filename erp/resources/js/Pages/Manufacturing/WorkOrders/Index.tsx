import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product { id: number; name: string; }
interface WorkCenter { id: number; name: string; }

interface WorkOrder {
    id: number;
    sequence: number;
    operation_name: string;
    work_center: WorkCenter | null;
    duration_expected: number;
    duration_actual: number;
    duration_label: string;
    status: string;
    actual_start: string | null;
    actual_finish: string | null;
}

interface MO {
    id: number;
    mo_number: string | null;
    product: Product;
}

interface Props extends PageProps {
    order: MO;
    workOrders: WorkOrder[];
}

const statusBadge: Record<string, string> = {
    pending:     'bg-slate-100 text-slate-600',
    in_progress: 'bg-yellow-100 text-yellow-800',
    done:        'bg-green-100 text-green-800',
    cancelled:   'bg-red-100 text-red-800',
};

export default function WorkOrdersIndex({ order, workOrders }: Props) {
    function handleAction(woId: number, action: string) {
        router.post(`/manufacturing/manufacturing-orders/${order.id}/work-orders/${woId}/${action}`);
    }

    function handleDelete(woId: number) {
        if (confirm('Delete this work order?')) {
            router.delete(`/manufacturing/manufacturing-orders/${order.id}/work-orders/${woId}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Work Orders" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Work Orders</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            For MO: <Link href={`/manufacturing/manufacturing-orders/${order.id}`} className="text-indigo-600 hover:text-indigo-800">
                                {order.mo_number ?? `#${order.id}`}
                            </Link> — {order.product.name}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/manufacturing/manufacturing-orders/${order.id}/work-orders/create`}>
                            <Button>New Work Order</Button>
                        </Link>
                        <Link href={`/manufacturing/manufacturing-orders/${order.id}`}>
                            <Button variant="secondary">Back to MO</Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Seq</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Operation</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Work Center</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Expected</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actual</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {workOrders.map((wo) => (
                                    <tr key={wo.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm text-slate-600">{wo.sequence}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{wo.operation_name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{wo.work_center?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{wo.duration_label}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{wo.duration_actual > 0 ? `${wo.duration_actual}m` : '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[wo.status] ?? 'bg-slate-100'}`}>
                                                {wo.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex flex-wrap gap-1">
                                                {wo.status === 'pending' && (
                                                    <button onClick={() => handleAction(wo.id, 'start')} className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 hover:bg-yellow-200">Start</button>
                                                )}
                                                {wo.status === 'in_progress' && (
                                                    <button onClick={() => handleAction(wo.id, 'finish')} className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 hover:bg-green-200">Finish</button>
                                                )}
                                                {['pending', 'in_progress'].includes(wo.status) && (
                                                    <button onClick={() => handleAction(wo.id, 'cancel')} className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600 hover:bg-red-100">Cancel</button>
                                                )}
                                                <Link href={`/manufacturing/manufacturing-orders/${order.id}/work-orders/${wo.id}/edit`} className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 hover:bg-indigo-100">Edit</Link>
                                                <button onClick={() => handleDelete(wo.id)} className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600 hover:bg-red-100">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {workOrders.length === 0 && (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No work orders found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

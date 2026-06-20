import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface WorkCenter {
    id: number;
    name: string;
}

interface WorkOrder {
    id: number;
    operation_name: string;
    sequence: number;
    status: string;
    duration_label: string;
    work_center: WorkCenter | null;
    actual_start: string | null;
    actual_finish: string | null;
}

interface ManufacturingOrder {
    id: number;
    mo_number: string | null;
    product: Product;
    qty_to_produce: number;
    qty_produced: number;
    progress_percentage: number;
    status: string;
    work_orders: WorkOrder[];
}

interface Props extends PageProps {
    orders: ManufacturingOrder[];
}

const WO_STATUS_COLORS: Record<string, string> = {
    pending:     'bg-slate-100 text-slate-600',
    in_progress: 'bg-yellow-100 text-yellow-800',
    done:        'bg-green-100 text-green-800',
    cancelled:   'bg-red-100 text-red-800',
};

export default function ShopFloorIndex({ orders }: Props) {
    function handleStart(workOrderId: number) {
        router.post(`/manufacturing/shop-floor/work-orders/${workOrderId}/start`);
    }

    function handleFinish(workOrderId: number) {
        router.post(`/manufacturing/shop-floor/work-orders/${workOrderId}/finish`);
    }

    return (
        <AppLayout>
            <Head title="Shop Floor" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Shop Floor</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {orders.length} manufacturing order{orders.length !== 1 ? 's' : ''} in progress
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-slate-400">
                        No manufacturing orders are currently in progress.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {orders.map(order => {
                            const progress = Math.min(100, Math.round(order.progress_percentage ?? 0));
                            return (
                                <div key={order.id} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                                    {/* MO Header */}
                                    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium uppercase">Manufacturing Order</p>
                                                <h3 className="text-sm font-bold text-slate-900">
                                                    {order.mo_number ?? `#${order.id}`}
                                                </h3>
                                            </div>
                                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                                In Progress
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 mt-1">{order.product.name}</p>
                                    </div>

                                    {/* Progress */}
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>Progress</span>
                                            <span>{Number(order.qty_produced).toFixed(2)} / {Number(order.qty_to_produce).toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-indigo-500 h-2 rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 text-right">{progress}%</p>
                                    </div>

                                    {/* Work Orders */}
                                    <div className="divide-y divide-slate-50">
                                        {order.work_orders.length === 0 ? (
                                            <p className="px-4 py-3 text-xs text-slate-400">No work orders.</p>
                                        ) : order.work_orders.map(wo => (
                                            <div key={wo.id} className="px-4 py-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-slate-800 truncate">
                                                            {wo.sequence}. {wo.operation_name}
                                                        </p>
                                                        {wo.work_center && (
                                                            <p className="text-xs text-slate-400">{wo.work_center.name}</p>
                                                        )}
                                                        <p className="text-xs text-slate-400">{wo.duration_label}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${WO_STATUS_COLORS[wo.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                            {wo.status.replace('_', ' ')}
                                                        </span>
                                                        {wo.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleStart(wo.id)}
                                                                className="text-xs bg-indigo-600 text-white rounded px-2 py-0.5 hover:bg-indigo-700"
                                                            >
                                                                Start
                                                            </button>
                                                        )}
                                                        {wo.status === 'in_progress' && (
                                                            <button
                                                                onClick={() => handleFinish(wo.id)}
                                                                className="text-xs bg-green-600 text-white rounded px-2 py-0.5 hover:bg-green-700"
                                                            >
                                                                Finish
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

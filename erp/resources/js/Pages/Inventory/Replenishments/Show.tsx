import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface ReplenishmentOrder {
    id: number;
    order_number: string | null;
    product: { id: number; name: string; sku: string } | null;
    warehouse: { id: number; name: string } | null;
    supplier: { id: number; name: string } | null;
    qty_on_hand: number;
    qty_needed: number;
    qty_to_order: number;
    route: string;
    status: string;
    scheduled_date: string | null;
    notes: string | null;
}

interface Props extends PageProps {
    replenishment: ReplenishmentOrder;
}

const routeColors: Record<string, string> = {
    buy:         'bg-blue-100 text-blue-700',
    manufacture: 'bg-purple-100 text-purple-700',
    resupply:    'bg-teal-100 text-teal-700',
};

const routeLabels: Record<string, string> = {
    buy:         'Purchase Order',
    manufacture: 'Manufacturing Order',
    resupply:    'Internal Transfer',
};

const statusColors: Record<string, string> = {
    draft:       'bg-slate-100 text-slate-600',
    confirmed:   'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    done:        'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-700',
};

export default function ReplenishmentsShow({ replenishment }: Props) {
    function postAction(action: string) {
        router.post(`/inventory/replenishments/${replenishment.id}/${action}`);
    }

    return (
        <AppLayout>
            <Head title={`Replenishment ${replenishment.order_number ?? '#' + replenishment.id}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {replenishment.order_number ?? `#${replenishment.id}`}
                        </h1>
                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[replenishment.status] ?? 'bg-slate-100 text-slate-600'}`}>
                            {replenishment.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {replenishment.status === 'draft' && (
                            <button onClick={() => postAction('confirm')} className="rounded bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600">
                                Confirm
                            </button>
                        )}
                        {replenishment.status === 'confirmed' && (
                            <button onClick={() => postAction('start')} className="rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600">
                                Start
                            </button>
                        )}
                        {replenishment.status === 'in_progress' && (
                            <button onClick={() => postAction('complete')} className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                                Complete
                            </button>
                        )}
                        {!['done', 'cancelled'].includes(replenishment.status) && (
                            <button onClick={() => postAction('cancel')} className="rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600">
                                Cancel
                            </button>
                        )}
                        <Link href="/inventory/replenishments" className="text-sm text-blue-600 hover:underline">
                            Back
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Product</span>
                            <p className="mt-1 text-sm text-slate-900">{replenishment.product?.name ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">SKU</span>
                            <p className="mt-1 text-sm text-slate-900">{replenishment.product?.sku ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Warehouse</span>
                            <p className="mt-1 text-sm text-slate-900">{replenishment.warehouse?.name ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Qty on Hand</span>
                            <p className="mt-1 text-sm text-slate-900">{replenishment.qty_on_hand}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Qty Needed</span>
                            <p className="mt-1 text-sm text-slate-900">{replenishment.qty_needed}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Qty to Order</span>
                            <p className="mt-1 text-sm text-slate-900">{replenishment.qty_to_order}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Route</span>
                            <p className="mt-1">
                                <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${routeColors[replenishment.route] ?? 'bg-slate-100 text-slate-600'}`}>
                                    {routeLabels[replenishment.route] ?? replenishment.route}
                                </span>
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Supplier</span>
                            <p className="mt-1 text-sm text-slate-900">{replenishment.supplier?.name ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Scheduled Date</span>
                            <p className="mt-1 text-sm text-slate-900">{replenishment.scheduled_date ?? '—'}</p>
                        </div>
                    </div>
                    {replenishment.notes && (
                        <div className="mt-4">
                            <span className="text-xs font-medium uppercase text-slate-500">Notes</span>
                            <p className="mt-1 text-sm text-slate-900">{replenishment.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
}

interface Warehouse {
    id: number;
    name: string;
}

interface Supplier {
    id: number;
    name: string;
}

interface ReplenishmentOrder {
    id: number;
    order_number: string | null;
    product: Product | null;
    warehouse: Warehouse | null;
    supplier: Supplier | null;
    qty_to_order: number;
    route: string;
    status: string;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props extends PageProps {
    replenishments: Paginator<ReplenishmentOrder>;
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

export default function ReplenishmentsIndex({ replenishments }: Props) {
    function postAction(id: number, action: string) {
        router.post(`/inventory/replenishments/${id}/${action}`);
    }

    return (
        <AppLayout>
            <Head title="Replenishment Orders" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Replenishment Orders</h1>
                    <Link
                        href="/inventory/replenishments/create"
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        New Replenishment
                    </Link>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Order #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Warehouse</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Qty to Order</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Route</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Supplier</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {replenishments.data.map((rep) => (
                                <tr key={rep.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        <Link href={`/inventory/replenishments/${rep.id}`} className="hover:underline">
                                            {rep.order_number ?? `#${rep.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-900">{rep.product?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{rep.warehouse?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{rep.qty_to_order}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${routeColors[rep.route] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {routeLabels[rep.route] ?? rep.route}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[rep.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {rep.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{rep.supplier?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm space-x-1">
                                        {rep.status === 'draft' && (
                                            <button onClick={() => postAction(rep.id, 'confirm')} className="rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white hover:bg-yellow-600">
                                                Confirm
                                            </button>
                                        )}
                                        {rep.status === 'confirmed' && (
                                            <button onClick={() => postAction(rep.id, 'start')} className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white hover:bg-blue-600">
                                                Start
                                            </button>
                                        )}
                                        {rep.status === 'in_progress' && (
                                            <button onClick={() => postAction(rep.id, 'complete')} className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700">
                                                Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {replenishments.data.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No replenishment orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface StockPicking {
    id: number;
    picking_number: string | null;
    picking_type: string;
    status: string;
    warehouse: { id: number; name: string } | null;
    partner_name: string | null;
    scheduled_date: string | null;
    lines_count: number;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props extends PageProps {
    stockPickings: Paginator<StockPicking>;
}

const typeColors: Record<string, string> = {
    incoming: 'bg-green-100 text-green-700',
    outgoing: 'bg-orange-100 text-orange-700',
    internal: 'bg-blue-100 text-blue-700',
    return:   'bg-purple-100 text-purple-700',
};

const typeLabels: Record<string, string> = {
    incoming: 'Incoming Receipt',
    outgoing: 'Outgoing Delivery',
    internal: 'Internal Transfer',
    return:   'Return',
};

const statusColors: Record<string, string> = {
    draft:       'bg-slate-100 text-slate-600',
    confirmed:   'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    done:        'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-700',
};

export default function StockPickingsIndex({ stockPickings }: Props) {
    function postAction(url: string) {
        router.post(url);
    }

    return (
        <AppLayout>
            <Head title="Stock Pickings" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Stock Pickings</h1>
                    <Link
                        href="/inventory/stock-pickings/create"
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        New Picking
                    </Link>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Warehouse</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Partner</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Scheduled</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Lines</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {stockPickings.data.map((picking) => (
                                <tr key={picking.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        <Link href={`/inventory/stock-pickings/${picking.id}`} className="hover:underline">
                                            {picking.picking_number ?? `#${picking.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${typeColors[picking.picking_type] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {typeLabels[picking.picking_type] ?? picking.picking_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[picking.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {picking.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{picking.warehouse?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{picking.partner_name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{picking.scheduled_date ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{picking.lines_count}</td>
                                    <td className="px-4 py-3 text-sm space-x-2">
                                        {picking.status === 'draft' && (
                                            <button
                                                onClick={() => postAction(`/inventory/stock-pickings/${picking.id}/confirm`)}
                                                className="rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white hover:bg-yellow-600"
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        {picking.status === 'confirmed' && (
                                            <button
                                                onClick={() => postAction(`/inventory/stock-pickings/${picking.id}/start`)}
                                                className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white hover:bg-blue-600"
                                            >
                                                Start
                                            </button>
                                        )}
                                        {picking.status === 'in_progress' && (
                                            <button
                                                onClick={() => postAction(`/inventory/stock-pickings/${picking.id}/validate`)}
                                                className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
                                            >
                                                Validate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {stockPickings.data.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No stock pickings found.
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

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface LotNumber {
    id: number;
    lot_number: string;
}

interface SerialNumber {
    id: number;
    serial_number: string;
}

interface StockPickingLine {
    id: number;
    product: Product | null;
    qty_demanded: number;
    qty_done: number;
    lot: LotNumber | null;
    serial: SerialNumber | null;
    state: string;
    notes: string | null;
}

interface StockPicking {
    id: number;
    picking_number: string | null;
    picking_type: string;
    status: string;
    warehouse: { id: number; name: string } | null;
    partner_name: string | null;
    origin: string | null;
    scheduled_date: string | null;
    done_date: string | null;
    notes: string | null;
    lines: StockPickingLine[];
}

interface Props extends PageProps {
    stockPicking: StockPicking;
}

const statusColors: Record<string, string> = {
    draft:       'bg-slate-100 text-slate-600',
    confirmed:   'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    done:        'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-700',
};

const lineStateColors: Record<string, string> = {
    pending:   'bg-slate-100 text-slate-600',
    done:      'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function StockPickingsShow({ stockPicking }: Props) {
    function postAction(path: string) {
        router.post(`/inventory/stock-pickings/${stockPicking.id}/${path}`);
    }

    return (
        <AppLayout>
            <Head title={`Picking ${stockPicking.picking_number ?? '#' + stockPicking.id}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {stockPicking.picking_number ?? `#${stockPicking.id}`}
                        </h1>
                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[stockPicking.status] ?? 'bg-slate-100 text-slate-600'}`}>
                            {stockPicking.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {stockPicking.status === 'draft' && (
                            <button onClick={() => postAction('confirm')} className="rounded bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600">
                                Confirm
                            </button>
                        )}
                        {stockPicking.status === 'confirmed' && (
                            <button onClick={() => postAction('start')} className="rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600">
                                Start Processing
                            </button>
                        )}
                        {stockPicking.status === 'in_progress' && (
                            <button onClick={() => postAction('validate')} className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                                Validate
                            </button>
                        )}
                        {!['done', 'cancelled'].includes(stockPicking.status) && (
                            <button onClick={() => postAction('cancel')} className="rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600">
                                Cancel
                            </button>
                        )}
                        <Link href="/inventory/stock-pickings" className="text-sm text-blue-600 hover:underline">
                            Back
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Type</span>
                            <p className="mt-1 text-sm text-slate-900 capitalize">{stockPicking.picking_type}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Warehouse</span>
                            <p className="mt-1 text-sm text-slate-900">{stockPicking.warehouse?.name ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Partner</span>
                            <p className="mt-1 text-sm text-slate-900">{stockPicking.partner_name ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Origin</span>
                            <p className="mt-1 text-sm text-slate-900">{stockPicking.origin ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Scheduled Date</span>
                            <p className="mt-1 text-sm text-slate-900">{stockPicking.scheduled_date ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase text-slate-500">Done Date</span>
                            <p className="mt-1 text-sm text-slate-900">{stockPicking.done_date ?? '—'}</p>
                        </div>
                    </div>
                    {stockPicking.notes && (
                        <div className="mt-4">
                            <span className="text-xs font-medium uppercase text-slate-500">Notes</span>
                            <p className="mt-1 text-sm text-slate-900">{stockPicking.notes}</p>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-900">Lines</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Demanded</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Done</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Lot</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Serial</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {stockPicking.lines.map((line) => (
                                <tr key={line.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-900">{line.product?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{line.qty_demanded}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{line.qty_done}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{line.lot?.lot_number ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{line.serial?.serial_number ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize ${lineStateColors[line.state] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {line.state}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {stockPicking.lines.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">No lines added.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

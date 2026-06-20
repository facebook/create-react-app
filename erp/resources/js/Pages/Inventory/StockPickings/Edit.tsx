import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Warehouse {
    id: number;
    name: string;
}

interface Zone {
    id: number;
    name: string;
    warehouse_id: number;
}

interface StockPicking {
    id: number;
    picking_type: string;
    warehouse_id: number | null;
    origin: string | null;
    partner_name: string | null;
    scheduled_date: string | null;
    notes: string | null;
}

interface Props extends PageProps {
    stockPicking: StockPicking;
    warehouses: Warehouse[];
    zones: Zone[];
}

export default function StockPickingsEdit({ stockPicking, warehouses }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        picking_type:   stockPicking.picking_type,
        warehouse_id:   stockPicking.warehouse_id?.toString() ?? '',
        origin:         stockPicking.origin ?? '',
        partner_name:   stockPicking.partner_name ?? '',
        scheduled_date: stockPicking.scheduled_date ?? '',
        notes:          stockPicking.notes ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/inventory/stock-pickings/${stockPicking.id}`);
    }

    return (
        <AppLayout>
            <Head title="Edit Stock Picking" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Stock Picking</h1>
                    <Link href="/inventory/stock-pickings" className="text-sm text-blue-600 hover:underline">
                        Back to list
                    </Link>
                </div>
                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Picking Type *</label>
                        <select
                            value={data.picking_type}
                            onChange={(e) => setData('picking_type', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="incoming">Incoming Receipt</option>
                            <option value="outgoing">Outgoing Delivery</option>
                            <option value="internal">Internal Transfer</option>
                            <option value="return">Return</option>
                        </select>
                        {errors.picking_type && <p className="mt-1 text-xs text-red-600">{errors.picking_type}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Warehouse</label>
                        <select
                            value={data.warehouse_id}
                            onChange={(e) => setData('warehouse_id', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">— None —</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Origin</label>
                        <input
                            type="text"
                            value={data.origin}
                            onChange={(e) => setData('origin', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Partner Name</label>
                        <input
                            type="text"
                            value={data.partner_name}
                            onChange={(e) => setData('partner_name', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Scheduled Date</label>
                        <input
                            type="date"
                            value={data.scheduled_date}
                            onChange={(e) => setData('scheduled_date', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Link
                            href="/inventory/stock-pickings"
                            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
}

interface LotNumber {
    id: number;
    lot_number: string;
    product_id: number;
    product: Product | null;
}

interface SerialNumber {
    id: number;
    serial_number: string;
    product_id: number;
    product: Product | null;
}

interface StockMovement {
    id: number;
    type: string;
    quantity: string;
    reference: string | null;
    created_at: string;
    product: Product | null;
    warehouse: { id: number; name: string } | null;
}

interface TrackedItem {
    id: number;
    lot_number?: string;
    serial_number?: string;
    product: Product | null;
}

interface Props extends PageProps {
    lots: LotNumber[];
    serials: SerialNumber[];
    movements: StockMovement[];
    trackedItem: TrackedItem | null;
    lotId: string | null;
    serialId: string | null;
}

const typeColors: Record<string, string> = {
    in:         'bg-green-100 text-green-700',
    out:        'bg-red-100 text-red-700',
    adjustment: 'bg-blue-100 text-blue-700',
};

export default function TraceabilityIndex({ lots, serials, movements, trackedItem, lotId, serialId }: Props) {
    function onLotChange(value: string) {
        router.get('/inventory/traceability', value ? { lot_id: value } : {}, { preserveState: false });
    }

    function onSerialChange(value: string) {
        router.get('/inventory/traceability', value ? { serial_id: value } : {}, { preserveState: false });
    }

    return (
        <AppLayout>
            <Head title="Product Traceability" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Product Traceability</h1>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Select Lot Number</label>
                            <select
                                value={lotId ?? ''}
                                onChange={(e) => onLotChange(e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">— Select Lot Number —</option>
                                {lots.map((lot) => (
                                    <option key={lot.id} value={lot.id}>
                                        {lot.lot_number} {lot.product ? `(${lot.product.name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Select Serial Number</label>
                            <select
                                value={serialId ?? ''}
                                onChange={(e) => onSerialChange(e.target.value)}
                                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">— Select Serial Number —</option>
                                {serials.map((serial) => (
                                    <option key={serial.id} value={serial.id}>
                                        {serial.serial_number} {serial.product ? `(${serial.product.name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {trackedItem ? (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900 mb-3">Tracked Item</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-medium uppercase text-slate-500">Product</span>
                                    <p className="mt-1 text-sm text-slate-900">{trackedItem.product?.name ?? '—'}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-medium uppercase text-slate-500">
                                        {trackedItem.lot_number ? 'Lot Number' : 'Serial Number'}
                                    </span>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {trackedItem.lot_number ?? trackedItem.serial_number ?? '—'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-200">
                                <h2 className="text-base font-semibold text-slate-900">Movement History ({movements.length})</h2>
                            </div>
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Warehouse</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Reference</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {movements.map((movement) => (
                                        <tr key={movement.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-600">{movement.created_at.split('T')[0]}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize ${typeColors[movement.type] ?? 'bg-slate-100 text-slate-600'}`}>
                                                    {movement.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{movement.warehouse?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{movement.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{movement.reference ?? '—'}</td>
                                        </tr>
                                    ))}
                                    {movements.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                                                No movements found for this item.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-slate-200 bg-white p-12 shadow-sm text-center">
                        <p className="text-slate-500 text-sm">Select a lot or serial number to trace</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

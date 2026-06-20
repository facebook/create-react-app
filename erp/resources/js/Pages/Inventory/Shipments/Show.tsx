import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ShipmentItem {
    id: number;
    description: string | null;
    quantity: number;
    sku: string | null;
}

interface Shipment {
    id: number;
    shipment_number: string | null;
    type: string;
    status: string;
    carrier: string | null;
    tracking_number: string | null;
    service_level: string | null;
    origin_address: string | null;
    destination_address: string | null;
    ship_date: string | null;
    estimated_delivery: string | null;
    actual_delivery: string | null;
    weight_kg: number | null;
    freight_cost: number | null;
    notes: string | null;
    items: ShipmentItem[];
}

interface Props extends PageProps {
    shipment: Shipment;
}

const STATUS_COLORS: Record<string, string> = {
    pending:      'bg-yellow-100 text-yellow-800',
    'in-transit': 'bg-blue-100 text-blue-700',
    delivered:    'bg-green-100 text-green-700',
    returned:     'bg-orange-100 text-orange-700',
    cancelled:    'bg-red-100 text-red-700',
};

export default function ShipmentShow({ shipment }: Props) {
    return (
        <AppLayout>
            <Head title={`Shipment ${shipment.shipment_number ?? shipment.id}`} />
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">
                                {shipment.shipment_number ?? `Shipment #${shipment.id}`}
                            </h1>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[shipment.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                {shipment.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 capitalize">{shipment.type}</p>
                    </div>
                    <div className="flex gap-2">
                        {shipment.status === 'pending' && (
                            <Button onClick={() => router.post(`/inventory/shipments/${shipment.id}/dispatch`)}>
                                Dispatch
                            </Button>
                        )}
                        {shipment.status === 'in-transit' && (
                            <Button onClick={() => router.post(`/inventory/shipments/${shipment.id}/deliver`)}>
                                Mark Delivered
                            </Button>
                        )}
                        <Link href="/inventory/shipments">
                            <Button variant="secondary">Back</Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Shipment Details</h2>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Carrier</dt>
                            <dd className="mt-0.5 text-slate-700">{shipment.carrier ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Tracking Number</dt>
                            <dd className="mt-0.5 font-mono text-slate-700">{shipment.tracking_number ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Service Level</dt>
                            <dd className="mt-0.5 text-slate-700 capitalize">{shipment.service_level ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Ship Date</dt>
                            <dd className="mt-0.5 text-slate-700">{shipment.ship_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Est. Delivery</dt>
                            <dd className="mt-0.5 text-slate-700">{shipment.estimated_delivery ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Actual Delivery</dt>
                            <dd className="mt-0.5 text-slate-700">{shipment.actual_delivery ?? '—'}</dd>
                        </div>
                        {shipment.weight_kg !== null && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Weight (kg)</dt>
                                <dd className="mt-0.5 text-slate-700">{shipment.weight_kg}</dd>
                            </div>
                        )}
                        {shipment.freight_cost !== null && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Freight Cost</dt>
                                <dd className="mt-0.5 text-slate-700">${shipment.freight_cost.toFixed(2)}</dd>
                            </div>
                        )}
                    </dl>
                    {shipment.notes && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Notes</dt>
                            <dd className="text-sm text-slate-600">{shipment.notes}</dd>
                        </div>
                    )}
                </div>

                {shipment.items.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100">
                            <h2 className="text-sm font-semibold text-slate-700">Items ({shipment.items.length})</h2>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">SKU</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Description</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {shipment.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-mono text-slate-500">{item.sku ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{item.description ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

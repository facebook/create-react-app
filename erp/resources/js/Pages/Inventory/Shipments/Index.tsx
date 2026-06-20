import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Shipment {
    id: number;
    shipment_number: string | null;
    type: string;
    status: string;
    carrier: string | null;
    tracking_number: string | null;
    ship_date: string | null;
    estimated_delivery: string | null;
}

interface Props extends PageProps {
    shipments: { data: Shipment[]; current_page: number; last_page: number };
}

const STATUS_COLORS: Record<string, string> = {
    pending:      'bg-yellow-100 text-yellow-800',
    'in-transit': 'bg-blue-100 text-blue-700',
    delivered:    'bg-green-100 text-green-700',
    returned:     'bg-orange-100 text-orange-700',
    cancelled:    'bg-red-100 text-red-700',
};

export default function ShipmentsIndex({ shipments }: Props) {
    return (
        <AppLayout>
            <Head title="Shipments" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Shipments</h1>
                        <p className="text-sm text-slate-500 mt-1">{shipments.data.length} shipments</p>
                    </div>
                    <Link href="/inventory/shipments/create">
                        <Button>New Shipment</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Carrier</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Tracking</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Ship Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Est. Delivery</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {shipments.data.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No shipments found.
                                    </td>
                                </tr>
                            )}
                            {shipments.data.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/inventory/shipments/${s.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                            {s.shipment_number ?? `#${s.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{s.type}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{s.carrier ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm font-mono text-slate-500">{s.tracking_number ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{s.ship_date ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{s.estimated_delivery ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-3">
                                            {s.status === 'pending' && (
                                                <button
                                                    onClick={() => router.post(`/inventory/shipments/${s.id}/dispatch`)}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    Dispatch
                                                </button>
                                            )}
                                            {s.status === 'in-transit' && (
                                                <button
                                                    onClick={() => router.post(`/inventory/shipments/${s.id}/deliver`)}
                                                    className="text-sm text-green-600 hover:text-green-800"
                                                >
                                                    Delivered
                                                </button>
                                            )}
                                            <Link href={`/inventory/shipments/${s.id}/edit`} className="text-sm text-slate-500 hover:text-slate-700">
                                                Edit
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

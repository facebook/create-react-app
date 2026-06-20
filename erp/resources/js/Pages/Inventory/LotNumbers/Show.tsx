import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { LotNumber, SerialNumber } from '@/types/inventory';

interface Props extends PageProps {
    lot: LotNumber & { serial_numbers?: SerialNumber[] };
}

const statusColors: Record<string, string> = {
    active:     'bg-green-100 text-green-700',
    quarantine: 'bg-amber-100 text-amber-700',
    consumed:   'bg-slate-100 text-slate-500',
    expired:    'bg-red-100 text-red-600',
};

const snStatusColors: Record<string, string> = {
    in_stock:  'bg-green-100 text-green-700',
    sold:      'bg-blue-100 text-blue-700',
    returned:  'bg-amber-100 text-amber-700',
    scrapped:  'bg-red-100 text-red-600',
};

export default function LotNumberShow({ lot }: Props) {
    const { can } = usePermission();

    const quarantineForm = useForm({ notes: '' });
    const consumeForm    = useForm({ qty: '' });

    function handleQuarantine(e: React.FormEvent) {
        e.preventDefault();
        if (!confirm('Quarantine this lot?')) return;
        quarantineForm.post(`/inventory/lot-numbers/${lot.id}/quarantine`, { preserveScroll: true });
    }

    function handleConsume(e: React.FormEvent) {
        e.preventDefault();
        consumeForm.post(`/inventory/lot-numbers/${lot.id}/consume`, { preserveScroll: true, onSuccess: () => consumeForm.reset() });
    }

    return (
        <AppLayout>
            <Head title={`Lot ${lot.lot_number}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/inventory/lot-numbers" className="text-sm text-slate-500 hover:text-slate-700">
                            ← Lot Numbers
                        </a>
                        <h1 className="text-2xl font-semibold text-slate-900">{lot.lot_number}</h1>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[lot.status] ?? ''}`}>
                            {lot.status}
                        </span>
                        {lot.is_expiring && (
                            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
                                Expiring soon
                            </span>
                        )}
                        {lot.is_expired && (
                            <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-700">
                                Expired
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Lot Details */}
                    <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Lot Details</h2>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt className="text-slate-500">Product</dt>
                                <dd className="font-medium text-slate-900">{lot.product?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Warehouse</dt>
                                <dd className="font-medium text-slate-900">{lot.warehouse?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Manufacture Date</dt>
                                <dd className="font-medium text-slate-900">{lot.manufacture_date ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Expiry Date</dt>
                                <dd className={`font-medium ${lot.is_expired ? 'text-red-600' : lot.is_expiring ? 'text-amber-600' : 'text-slate-900'}`}>
                                    {lot.expiry_date ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Qty Received</dt>
                                <dd className="font-medium text-slate-900">{lot.quantity_received}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Qty Remaining</dt>
                                <dd className="font-medium text-slate-900">{lot.quantity_remaining}</dd>
                            </div>
                            {lot.notes && (
                                <div className="col-span-2">
                                    <dt className="text-slate-500">Notes</dt>
                                    <dd className="text-slate-900">{lot.notes}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        {can('inventory.create') && lot.status === 'active' && (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-slate-900 mb-3">Quarantine Lot</h2>
                                <form onSubmit={handleQuarantine} className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Reason (optional)</label>
                                        <textarea
                                            value={quarantineForm.data.notes}
                                            onChange={(e) => quarantineForm.setData('notes', e.target.value)}
                                            rows={2}
                                            placeholder="e.g. Failed quality check..."
                                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <Button type="submit" variant="secondary" size="sm" className="w-full" disabled={quarantineForm.processing}>
                                        {quarantineForm.processing ? 'Processing...' : 'Quarantine'}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {can('inventory.create') && lot.quantity_remaining > 0 && (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-slate-900 mb-3">Record Consumption</h2>
                                <form onSubmit={handleConsume} className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Quantity to Consume</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={consumeForm.data.qty}
                                            onChange={(e) => consumeForm.setData('qty', e.target.value)}
                                            placeholder="0"
                                            required
                                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {consumeForm.errors.qty && (
                                            <p className="mt-1 text-xs text-red-600">{consumeForm.errors.qty}</p>
                                        )}
                                    </div>
                                    <Button type="submit" size="sm" className="w-full" disabled={consumeForm.processing}>
                                        {consumeForm.processing ? 'Processing...' : 'Consume'}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Serial Numbers in this Lot */}
                {lot.serial_numbers && lot.serial_numbers.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                            <h2 className="text-sm font-medium text-slate-700">Serial Numbers ({lot.serial_numbers.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Serial Number</th>
                                        <th className="px-4 py-2 text-left font-medium">Status</th>
                                        <th className="px-4 py-2 text-left font-medium">Received</th>
                                        <th className="px-4 py-2 text-left font-medium">Sold</th>
                                        <th className="px-4 py-2 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lot.serial_numbers.map((sn) => (
                                        <tr key={sn.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-2">
                                                <a href={`/inventory/serial-numbers/${sn.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                                    {sn.serial_number}
                                                </a>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${snStatusColors[sn.status] ?? ''}`}>
                                                    {sn.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-slate-600">{sn.received_date ?? '—'}</td>
                                            <td className="px-4 py-2 text-slate-600">{sn.sold_date ?? '—'}</td>
                                            <td className="px-4 py-2">
                                                <a href={`/inventory/serial-numbers/${sn.id}`} className="text-xs text-indigo-600 hover:text-indigo-800">
                                                    View
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

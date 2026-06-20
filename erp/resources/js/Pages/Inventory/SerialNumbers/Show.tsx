import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { SerialNumber } from '@/types/inventory';

interface Props extends PageProps {
    serial: SerialNumber & { lot?: { id: number; lot_number: string } | null };
}

const statusColors: Record<string, string> = {
    in_stock:  'bg-green-100 text-green-700',
    sold:      'bg-blue-100 text-blue-700',
    returned:  'bg-amber-100 text-amber-700',
    scrapped:  'bg-red-100 text-red-600',
};

export default function SerialNumberShow({ serial }: Props) {
    const { can } = usePermission();

    const sellForm  = useForm({ notes: '' });
    const scrapForm = useForm({ notes: '' });

    function handleSell(e: React.FormEvent) {
        e.preventDefault();
        if (!confirm('Mark this serial number as sold?')) return;
        sellForm.post(`/inventory/serial-numbers/${serial.id}/sell`, { preserveScroll: true });
    }

    function handleScrap(e: React.FormEvent) {
        e.preventDefault();
        if (!confirm('Scrap this serial number?')) return;
        scrapForm.post(`/inventory/serial-numbers/${serial.id}/scrap`, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title={`Serial ${serial.serial_number}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <a href="/inventory/serial-numbers" className="text-sm text-slate-500 hover:text-slate-700">
                        ← Serial Numbers
                    </a>
                    <h1 className="text-2xl font-semibold text-slate-900">{serial.serial_number}</h1>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[serial.status] ?? ''}`}>
                        {serial.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Details */}
                    <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Serial Number Details</h2>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt className="text-slate-500">Product</dt>
                                <dd className="font-medium text-slate-900">{serial.product?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Warehouse</dt>
                                <dd className="font-medium text-slate-900">{serial.warehouse?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Lot Number</dt>
                                <dd className="font-medium text-slate-900">
                                    {serial.lot
                                        ? <a href={`/inventory/lot-numbers/${serial.lot.id}`} className="text-indigo-600 hover:text-indigo-800">{serial.lot.lot_number}</a>
                                        : '—'
                                    }
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Status</dt>
                                <dd>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[serial.status] ?? ''}`}>
                                        {serial.status.replace('_', ' ')}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Received Date</dt>
                                <dd className="font-medium text-slate-900">{serial.received_date ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Sold Date</dt>
                                <dd className="font-medium text-slate-900">{serial.sold_date ?? '—'}</dd>
                            </div>
                            {serial.notes && (
                                <div className="col-span-2">
                                    <dt className="text-slate-500">Notes</dt>
                                    <dd className="text-slate-900">{serial.notes}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        {can('inventory.create') && serial.is_available && (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-slate-900 mb-3">Sell</h2>
                                <form onSubmit={handleSell} className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Notes (optional)</label>
                                        <textarea
                                            value={sellForm.data.notes}
                                            onChange={(e) => sellForm.setData('notes', e.target.value)}
                                            rows={2}
                                            placeholder="Sale reference, customer..."
                                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <Button type="submit" size="sm" className="w-full" disabled={sellForm.processing}>
                                        {sellForm.processing ? 'Processing...' : 'Mark as Sold'}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {can('inventory.create') && serial.status !== 'scrapped' && serial.status !== 'sold' && (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-slate-900 mb-3">Scrap</h2>
                                <form onSubmit={handleScrap} className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Reason (optional)</label>
                                        <textarea
                                            value={scrapForm.data.notes}
                                            onChange={(e) => scrapForm.setData('notes', e.target.value)}
                                            rows={2}
                                            placeholder="Reason for scrapping..."
                                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                    <Button type="submit" variant="danger" size="sm" className="w-full" disabled={scrapForm.processing}>
                                        {scrapForm.processing ? 'Processing...' : 'Scrap'}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

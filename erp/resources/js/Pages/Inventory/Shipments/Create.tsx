import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Props extends PageProps {}

export default function ShipmentCreate(_props: Props) {
    const { data, setData, post, processing, errors } = useForm({
        type: 'outbound',
        carrier: '',
        tracking_number: '',
        service_level: 'standard',
        origin_address: '',
        destination_address: '',
        ship_date: '',
        estimated_delivery: '',
        weight_kg: '',
        freight_cost: '',
        notes: '',
    });

    function inputCls() {
        return 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
    }

    return (
        <AppLayout>
            <Head title="New Shipment" />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">New Shipment</h1>
                    <Link href="/inventory/shipments">
                        <Button variant="secondary">Back</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={(e) => { e.preventDefault(); post('/inventory/shipments'); }}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className={inputCls()}
                                >
                                    <option value="outbound">Outbound</option>
                                    <option value="inbound">Inbound</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Service Level</label>
                                <select
                                    value={data.service_level}
                                    onChange={(e) => setData('service_level', e.target.value)}
                                    className={inputCls()}
                                >
                                    <option value="standard">Standard</option>
                                    <option value="express">Express</option>
                                    <option value="overnight">Overnight</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Carrier</label>
                                <input
                                    value={data.carrier}
                                    onChange={(e) => setData('carrier', e.target.value)}
                                    className={inputCls()}
                                    placeholder="e.g. FedEx, DHL"
                                />
                                {errors.carrier && <p className="text-xs text-red-600 mt-1">{errors.carrier}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Tracking Number</label>
                                <input
                                    value={data.tracking_number}
                                    onChange={(e) => setData('tracking_number', e.target.value)}
                                    className={inputCls()}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Ship Date</label>
                                <input
                                    type="date"
                                    value={data.ship_date}
                                    onChange={(e) => setData('ship_date', e.target.value)}
                                    className={inputCls()}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Est. Delivery</label>
                                <input
                                    type="date"
                                    value={data.estimated_delivery}
                                    onChange={(e) => setData('estimated_delivery', e.target.value)}
                                    className={inputCls()}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Origin Address</label>
                            <textarea
                                value={data.origin_address}
                                onChange={(e) => setData('origin_address', e.target.value)}
                                rows={2}
                                className={inputCls()}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Destination Address</label>
                            <textarea
                                value={data.destination_address}
                                onChange={(e) => setData('destination_address', e.target.value)}
                                rows={2}
                                className={inputCls()}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                className={inputCls()}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating…' : 'Create Shipment'}
                            </Button>
                            <Link href="/inventory/shipments">
                                <Button type="button" variant="secondary">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

import React from 'react';
import { Head, useForm } from '@inertiajs/react';

interface Shipment {
    id: number;
    carrier: string | null;
    tracking_number: string | null;
    service_level: string | null;
    origin_address: string | null;
    destination_address: string | null;
    ship_date: string | null;
    estimated_delivery: string | null;
    notes: string | null;
}

export default function Edit({ shipment }: { shipment: Shipment }) {
    const { data, setData, put } = useForm({
        carrier: shipment.carrier ?? '',
        tracking_number: shipment.tracking_number ?? '',
        service_level: shipment.service_level ?? 'standard',
        origin_address: shipment.origin_address ?? '',
        destination_address: shipment.destination_address ?? '',
        ship_date: shipment.ship_date ?? '',
        estimated_delivery: shipment.estimated_delivery ?? '',
        notes: shipment.notes ?? '',
    });

    return (
        <>
            <Head title="Edit Shipment" />
            <div className="p-6 max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Edit Shipment</h1>
                <form onSubmit={e => { e.preventDefault(); put(`/inventory/shipments/${shipment.id}`); }}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Carrier</label>
                            <input value={data.carrier} onChange={e => setData('carrier', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tracking Number</label>
                            <input value={data.tracking_number} onChange={e => setData('tracking_number', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ship Date</label>
                            <input type="date" value={data.ship_date} onChange={e => setData('ship_date', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Est. Delivery</label>
                            <input type="date" value={data.estimated_delivery} onChange={e => setData('estimated_delivery', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Save</button>
                </form>
            </div>
        </>
    );
}

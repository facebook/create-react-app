import React from 'react';
import { Head, useForm } from '@inertiajs/react';

interface RmaRequest { id: number; reason: string; contact_name: string | null; reference: string | null; disposition: string; requested_date: string | null; notes: string | null; }

export default function Edit({ rmaRequest }: { rmaRequest: RmaRequest }) {
    const { data, setData, put } = useForm({
        reason: rmaRequest.reason,
        contact_name: rmaRequest.contact_name ?? '',
        reference: rmaRequest.reference ?? '',
        disposition: rmaRequest.disposition,
        requested_date: rmaRequest.requested_date ?? '',
        notes: rmaRequest.notes ?? '',
    });

    return (
        <>
            <Head title="Edit RMA Request" />
            <div className="p-6 max-w-xl">
                <h1 className="text-2xl font-bold mb-6">Edit RMA Request</h1>
                <form onSubmit={e => { e.preventDefault(); put(`/inventory/rma-requests/${rmaRequest.id}`); }}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Disposition</label>
                            <select value={data.disposition} onChange={e => setData('disposition', e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="restock">Restock</option>
                                <option value="scrap">Scrap</option>
                                <option value="repair">Repair</option>
                                <option value="replace">Replace</option>
                                <option value="credit">Credit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Name</label>
                            <input value={data.contact_name} onChange={e => setData('contact_name', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Reason *</label>
                        <textarea value={data.reason} onChange={e => setData('reason', e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} className="w-full border rounded px-3 py-2" />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Save</button>
                </form>
            </div>
        </>
    );
}

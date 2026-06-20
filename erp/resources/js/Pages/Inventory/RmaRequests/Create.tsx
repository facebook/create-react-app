import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, errors } = useForm({
        type: 'customer_return',
        reason: '',
        contact_name: '',
        reference: '',
        disposition: 'restock',
        requested_date: '',
        notes: '',
    });

    return (
        <>
            <Head title="New RMA Request" />
            <div className="p-6 max-w-xl">
                <h1 className="text-2xl font-bold mb-6">New RMA Request</h1>
                <form onSubmit={e => { e.preventDefault(); post('/inventory/rma-requests'); }}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Type *</label>
                            <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="customer_return">Customer Return</option>
                                <option value="supplier_return">Supplier Return</option>
                            </select>
                        </div>
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
                        <div>
                            <label className="block text-sm font-medium mb-1">Reference</label>
                            <input value={data.reference} onChange={e => setData('reference', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Request Date</label>
                            <input type="date" value={data.requested_date} onChange={e => setData('requested_date', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Reason *</label>
                        <textarea value={data.reason} onChange={e => setData('reason', e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
                        {errors.reason && <p className="text-red-600 text-sm">{errors.reason}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} className="w-full border rounded px-3 py-2" />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Create RMA</button>
                </form>
            </div>
        </>
    );
}

import React from 'react';
import { Head, useForm } from '@inertiajs/react';

interface Contact { id: number; name: string; relationship: string; phone_primary: string; phone_secondary: string | null; email: string | null; address: string | null; is_primary: boolean; notes: string | null; }

export default function Edit({ contact }: { contact: Contact }) {
    const { data, setData, put } = useForm({
        name: contact.name,
        relationship: contact.relationship,
        phone_primary: contact.phone_primary,
        phone_secondary: contact.phone_secondary ?? '',
        email: contact.email ?? '',
        address: contact.address ?? '',
        is_primary: contact.is_primary,
        notes: contact.notes ?? '',
    });

    return (
        <>
            <Head title="Edit Emergency Contact" />
            <div className="p-6 max-w-xl">
                <h1 className="text-2xl font-bold mb-6">Edit Emergency Contact</h1>
                <form onSubmit={e => { e.preventDefault(); put(`/hr/emergency-contacts/${contact.id}`); }}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name *</label>
                            <input value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Relationship *</label>
                            <input value={data.relationship} onChange={e => setData('relationship', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Primary Phone *</label>
                            <input value={data.phone_primary} onChange={e => setData('phone_primary', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Secondary Phone</label>
                            <input value={data.phone_secondary} onChange={e => setData('phone_secondary', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={data.is_primary} onChange={e => setData('is_primary', e.target.checked)} />
                            <span className="text-sm">Primary contact</span>
                        </label>
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Save</button>
                </form>
            </div>
        </>
    );
}

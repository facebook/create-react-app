import React from 'react';
import { Head, useForm } from '@inertiajs/react';

interface Employee { id: number; first_name: string; last_name: string; }

export default function Create({ employee }: { employee: Employee }) {
    const { data, setData, post, errors } = useForm({
        name: '',
        relationship: '',
        phone_primary: '',
        phone_secondary: '',
        email: '',
        address: '',
        is_primary: false,
        notes: '',
    });

    return (
        <>
            <Head title="Add Emergency Contact" />
            <div className="p-6 max-w-xl">
                <h1 className="text-2xl font-bold mb-1">Add Emergency Contact</h1>
                <p className="text-gray-500 mb-6">{employee.first_name} {employee.last_name}</p>
                <form onSubmit={e => { e.preventDefault(); post(`/hr/employees/${employee.id}/emergency-contacts`); }}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name *</label>
                            <input value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded px-3 py-2" />
                            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Relationship *</label>
                            <input value={data.relationship} onChange={e => setData('relationship', e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Spouse, Parent, Sibling..." />
                            {errors.relationship && <p className="text-red-600 text-sm">{errors.relationship}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Primary Phone *</label>
                            <input value={data.phone_primary} onChange={e => setData('phone_primary', e.target.value)} className="w-full border rounded px-3 py-2" />
                            {errors.phone_primary && <p className="text-red-600 text-sm">{errors.phone_primary}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Secondary Phone</label>
                            <input value={data.phone_secondary} onChange={e => setData('phone_secondary', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={data.is_primary} onChange={e => setData('is_primary', e.target.checked)} />
                            <span className="text-sm">Set as primary contact</span>
                        </label>
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Add Contact</button>
                </form>
            </div>
        </>
    );
}

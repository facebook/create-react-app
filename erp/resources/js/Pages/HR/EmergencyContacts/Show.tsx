import React from 'react';
import { Head } from '@inertiajs/react';

interface Contact { id: number; name: string; relationship: string; phone_primary: string; phone_secondary: string | null; email: string | null; address: string | null; is_primary: boolean; notes: string | null; }
interface Employee { id: number; first_name: string; last_name: string; }

export default function Show({ employee, contact }: { employee: Employee; contact: Contact }) {
    return (
        <>
            <Head title={contact.name} />
            <div className="p-6 max-w-xl">
                <div className="flex justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">{contact.name}</h1>
                        <p className="text-gray-500">{contact.relationship} of {employee.first_name} {employee.last_name}</p>
                    </div>
                    {contact.is_primary && <span className="px-3 py-1 bg-green-100 text-green-800 rounded self-start">Primary</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><span className="font-medium">Phone:</span> {contact.phone_primary}</div>
                    {contact.phone_secondary && <div><span className="font-medium">Alt Phone:</span> {contact.phone_secondary}</div>}
                    {contact.email && <div><span className="font-medium">Email:</span> {contact.email}</div>}
                    {contact.address && <div className="col-span-2"><span className="font-medium">Address:</span> {contact.address}</div>}
                </div>
                {contact.notes && <p className="mt-4 text-gray-600">{contact.notes}</p>}
            </div>
        </>
    );
}

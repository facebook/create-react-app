import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Contact {
    id: number;
    name: string;
    relationship: string;
    phone_primary: string;
    phone_secondary: string | null;
    email: string | null;
    is_primary: boolean;
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
}

interface Props extends PageProps {
    employee: Employee;
    contacts: Contact[];
}

export default function EmergencyContactsIndex({ employee, contacts }: Props) {
    return (
        <AppLayout>
            <Head title="Emergency Contacts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Emergency Contacts</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {employee.first_name} {employee.last_name} &mdash; {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/hr/employees/${employee.id}`}>
                            <Button variant="secondary">Back to Employee</Button>
                        </Link>
                        <Link href={`/hr/employees/${employee.id}/emergency-contacts/create`}>
                            <Button>Add Contact</Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Relationship</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Primary</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No emergency contacts found.
                                    </td>
                                </tr>
                            )}
                            {contacts.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.relationship}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.phone_primary}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.email ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        {c.is_primary ? (
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                                                Primary
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => router.post(`/hr/employees/${employee.id}/emergency-contacts/${c.id}/mark-primary`)}
                                                className="text-sm text-indigo-600 hover:text-indigo-800"
                                            >
                                                Set Primary
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/hr/emergency-contacts/${c.id}/edit`} className="text-sm text-slate-500 hover:text-slate-700">
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Delete contact "${c.name}"?`)) {
                                                        router.delete(`/hr/emergency-contacts/${c.id}`);
                                                    }
                                                }}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
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

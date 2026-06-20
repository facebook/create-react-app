import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface AssignedUser {
    id: number;
    name: string;
}

interface EquipmentItem {
    id: number;
    name: string;
    code: string | null;
    category: string;
    location: string | null;
    status: string;
    assigned_user: AssignedUser | null;
}

interface PaginatedEquipment {
    data: EquipmentItem[];
    current_page: number;
    last_page: number;
}

interface Props extends PageProps {
    equipment: PaginatedEquipment;
}

const categoryColors: Record<string, string> = {
    machinery:   'bg-slate-100 text-slate-700',
    electrical:  'bg-yellow-100 text-yellow-700',
    hvac:        'bg-cyan-100 text-cyan-700',
    vehicle:     'bg-blue-100 text-blue-700',
    it:          'bg-purple-100 text-purple-700',
    other:       'bg-gray-100 text-gray-700',
};

const statusColors: Record<string, string> = {
    operational:       'bg-green-100 text-green-700',
    under_maintenance: 'bg-yellow-100 text-yellow-700',
    out_of_service:    'bg-red-100 text-red-700',
    retired:           'bg-gray-100 text-gray-600',
};

export default function EquipmentIndex({ equipment }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        category: 'machinery',
        location: '',
        serial_number: '',
        manufacturer: '',
        model: '',
        purchase_date: '',
        warranty_expiry: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/maintenance/equipment', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    return (
        <AppLayout>
            <Head title="Equipment" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Equipment</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        {showForm ? 'Cancel' : 'Add Equipment'}
                    </button>
                </div>

                {showForm && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-800">New Equipment</h2>
                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Name *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Code</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Category *</label>
                                <select
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="machinery">Machinery</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="hvac">HVAC</option>
                                    <option value="vehicle">Vehicle</option>
                                    <option value="it">IT</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Location</label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Serial Number</label>
                                <input
                                    type="text"
                                    value={data.serial_number}
                                    onChange={e => setData('serial_number', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Manufacturer</label>
                                <input
                                    type="text"
                                    value={data.manufacturer}
                                    onChange={e => setData('manufacturer', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Model</label>
                                <input
                                    type="text"
                                    value={data.model}
                                    onChange={e => setData('model', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Purchase Date</label>
                                <input
                                    type="date"
                                    value={data.purchase_date}
                                    onChange={e => setData('purchase_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Warranty Expiry</label>
                                <input
                                    type="date"
                                    value={data.warranty_expiry}
                                    onChange={e => setData('warranty_expiry', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { reset(); setShowForm(false); }}
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Equipment'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Location</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Assigned To</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {equipment.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                                            No equipment found. Add your first equipment above.
                                        </td>
                                    </tr>
                                )}
                                {equipment.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{item.code ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${categoryColors[item.category] ?? categoryColors.other}`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{item.location ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[item.status] ?? statusColors.operational}`}>
                                                {item.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{item.assigned_user?.name ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

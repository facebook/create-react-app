import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface AppointmentType {
    id: number;
    name: string;
    description: string | null;
    duration_minutes: number;
    location: string | null;
    max_capacity: number;
    is_active: boolean;
    color: string | null;
}

interface Props extends PageProps {
    types: {
        data: AppointmentType[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function AppointmentTypesIndex({ types }: Props) {
    const form = useForm({
        name: '',
        description: '',
        duration_minutes: 60,
        location: '',
        max_capacity: 1,
        color: '#3B82F6',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/appointments/types', {
            onSuccess: () => form.reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Appointment Types" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Appointment Types</h1>
                </div>

                {/* Add Type Form */}
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add Appointment Type</h2>
                    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Consultation"
                                required
                            />
                            {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                min={15}
                                value={form.data.duration_minutes}
                                onChange={(e) => form.setData('duration_minutes', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
                            <input
                                type="number"
                                min={1}
                                value={form.data.max_capacity}
                                onChange={(e) => form.setData('max_capacity', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                value={form.data.location}
                                onChange={(e) => form.setData('location', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Room 101"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input
                                type="text"
                                value={form.data.color}
                                onChange={(e) => form.setData('color', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="#3B82F6"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {form.processing ? 'Adding...' : 'Add Type'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Types Table */}
                <div className="bg-white rounded-xl shadow">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900">
                            All Types <span className="text-sm text-gray-500">({types.total})</span>
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {types.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                            No appointment types yet
                                        </td>
                                    </tr>
                                ) : (
                                    types.data.map((type) => (
                                        <tr key={type.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {type.color && (
                                                        <span
                                                            className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                                                            style={{ backgroundColor: type.color }}
                                                        />
                                                    )}
                                                    <span className="font-medium text-gray-900">{type.name}</span>
                                                </div>
                                                {type.description && (
                                                    <p className="text-xs text-gray-400 mt-0.5">{type.description}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    {type.duration_minutes} min
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{type.max_capacity}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{type.location ?? '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {type.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

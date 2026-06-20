import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
}

interface Station {
    id: number;
    name: string;
    location: string | null;
    is_active: boolean;
    responsible: User | null;
    checked_in_count?: number;
}

interface Props extends PageProps {
    stations: Station[];
}

export default function StationsIndex({ stations }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        location: '',
        responsible_id: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/frontdesk/stations', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Frontdesk Stations" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Reception Stations</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your frontdesk check-in stations.</p>
                </div>

                {/* Add Station Form */}
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add Station</h2>
                    <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Station Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Main Reception"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Floor 1"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {processing ? 'Adding...' : 'Add Station'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Stations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stations.length === 0 ? (
                        <div className="col-span-3 text-center py-12 text-gray-400">
                            No stations yet. Add one above.
                        </div>
                    ) : (
                        stations.map((station) => (
                            <div key={station.id} className="bg-white rounded-xl shadow p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{station.name}</h3>
                                        {station.location && (
                                            <p className="text-sm text-gray-500 mt-0.5">{station.location}</p>
                                        )}
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${station.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {station.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">
                                        Responsible: <span className="text-gray-700 font-medium">{station.responsible?.name ?? '—'}</span>
                                    </span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                                        {station.checked_in_count ?? 0} inside
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

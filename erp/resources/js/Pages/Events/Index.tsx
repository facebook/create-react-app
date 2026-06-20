import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface Event {
    id: number;
    title: string;
    description: string | null;
    location: string | null;
    starts_at: string;
    ends_at: string | null;
    capacity: number | null;
    status: 'draft' | 'published' | 'cancelled';
    registrations_count: number;
    created_at: string;
}

interface Paginated {
    data: Event[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    events: Paginated;
}

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    published: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function EventsIndex({ events }: Props) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title:       '',
        description: '',
        location:    '',
        starts_at:   '',
        ends_at:     '',
        capacity:    '',
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        post('/events', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    }

    function publish(id: number) {
        router.post(`/events/${id}/publish`);
    }

    function cancel(id: number) {
        router.post(`/events/${id}/cancel`);
    }

    return (
        <AppLayout>
            <Head title="Events" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
                        <p className="text-sm text-slate-500 mt-1">{events.total} records</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>New Event</Button>
                </div>

                {showForm && (
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-medium text-slate-800 mb-4">Create Event</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Event title"
                                />
                                {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Optional description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Event location"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Starts At *</label>
                                    <input
                                        type="datetime-local"
                                        value={data.starts_at}
                                        onChange={e => setData('starts_at', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {errors.starts_at && <p className="text-red-600 text-xs mt-1">{errors.starts_at}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ends At</label>
                                    <input
                                        type="datetime-local"
                                        value={data.ends_at}
                                        onChange={e => setData('ends_at', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                                <input
                                    type="number"
                                    value={data.capacity}
                                    onChange={e => setData('capacity', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Leave blank for unlimited"
                                    min="1"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>Create</Button>
                                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Location</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Registrations/Capacity</th>
                                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {events.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-slate-400 py-8">No events found.</td>
                                </tr>
                            )}
                            {events.data.map(event => (
                                <tr key={event.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/events/${event.id}`} className="font-medium text-indigo-600 hover:underline">
                                            {event.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{event.location ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {new Date(event.starts_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[event.status]}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {event.registrations_count}{event.capacity !== null ? ` / ${event.capacity}` : ''}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        {event.status === 'draft' && (
                                            <button
                                                onClick={() => publish(event.id)}
                                                className="text-xs text-green-600 hover:text-green-800 font-medium"
                                            >
                                                Publish
                                            </button>
                                        )}
                                        {event.status === 'published' && (
                                            <button
                                                onClick={() => cancel(event.id)}
                                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <Link href={`/events/${event.id}`} className="text-xs text-indigo-600 hover:underline">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {events.last_page > 1 && (
                    <div className="flex gap-2 justify-end">
                        {Array.from({ length: events.last_page }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => router.get('/events', { page }, { preserveState: true })}
                                className={`px-3 py-1 rounded text-sm border ${page === events.current_page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

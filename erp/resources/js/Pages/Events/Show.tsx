import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
}

interface EventRegistration {
    id: number;
    attendee_name: string;
    attendee_email: string;
    status: 'registered' | 'confirmed' | 'cancelled' | 'attended';
    registered_at: string;
    notes: string | null;
}

interface Event {
    id: number;
    title: string;
    description: string | null;
    location: string | null;
    starts_at: string;
    ends_at: string | null;
    capacity: number | null;
    status: 'draft' | 'published' | 'cancelled';
    organizer: User | null;
    registrations: EventRegistration[];
}

interface Props extends PageProps {
    event: Event;
}

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    published: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const regStatusBadge: Record<string, string> = {
    registered: 'bg-blue-100 text-blue-700',
    confirmed:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
    attended:   'bg-purple-100 text-purple-700',
};

export default function EventShow({ event }: Props) {
    const [showRegForm, setShowRegForm] = useState(false);

    const registrationCount = event.registrations.length;
    const isOpen = event.status === 'published'
        && (event.capacity === null || registrationCount < event.capacity)
        && (event.ends_at === null || new Date(event.ends_at) > new Date());

    const { data, setData, post, processing, reset, errors } = useForm({
        attendee_name:  '',
        attendee_email: '',
        notes:          '',
    });

    function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        post(`/events/${event.id}/register`, {
            onSuccess: () => {
                reset();
                setShowRegForm(false);
            },
        });
    }

    function publish() {
        router.post(`/events/${event.id}/publish`);
    }

    function cancelEvent() {
        router.post(`/events/${event.id}/cancel`);
    }

    function confirmReg(regId: number) {
        router.post(`/events/${event.id}/registrations/${regId}/confirm`);
    }

    function attendReg(regId: number) {
        router.post(`/events/${event.id}/registrations/${regId}/attend`);
    }

    function cancelReg(regId: number) {
        router.post(`/events/${event.id}/registrations/${regId}/cancel`);
    }

    return (
        <AppLayout>
            <Head title={event.title} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Link href="/events" className="text-sm text-slate-500 hover:text-slate-700">Events</Link>
                            <span className="text-slate-400">/</span>
                            <h1 className="text-2xl font-semibold text-slate-900">{event.title}</h1>
                        </div>
                        {event.description && (
                            <p className="text-sm text-slate-500 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[event.status]}`}>
                                {event.status}
                            </span>
                            {event.location && (
                                <span className="text-sm text-slate-500">{event.location}</span>
                            )}
                            <span className="text-xs text-slate-400">
                                Starts: {new Date(event.starts_at).toLocaleString()}
                            </span>
                            {event.ends_at && (
                                <span className="text-xs text-slate-400">
                                    Ends: {new Date(event.ends_at).toLocaleString()}
                                </span>
                            )}
                            <span className="text-sm text-slate-500">
                                {registrationCount}{event.capacity !== null ? ` / ${event.capacity}` : ''} spots
                            </span>
                            {event.organizer && (
                                <span className="text-xs text-slate-400">Organizer: {event.organizer.name}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {event.status === 'draft' && (
                            <Button onClick={publish}>Publish</Button>
                        )}
                        {event.status === 'published' && (
                            <button
                                onClick={cancelEvent}
                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                            >
                                Cancel Event
                            </button>
                        )}
                    </div>
                </div>

                {/* Register Form */}
                {isOpen && (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-medium text-slate-800">Register for this Event</h2>
                            <Button onClick={() => setShowRegForm(!showRegForm)}>
                                {showRegForm ? 'Hide Form' : 'Register'}
                            </Button>
                        </div>
                        {showRegForm && (
                            <div className="px-6 py-4">
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                                        <input
                                            type="text"
                                            value={data.attendee_name}
                                            onChange={e => setData('attendee_name', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Your full name"
                                        />
                                        {errors.attendee_name && <p className="text-red-600 text-xs mt-1">{errors.attendee_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            value={data.attendee_email}
                                            onChange={e => setData('attendee_email', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="your@email.com"
                                        />
                                        {errors.attendee_email && <p className="text-red-600 text-xs mt-1">{errors.attendee_email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                        <textarea
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
                                            rows={2}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Any notes or special requirements"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button type="submit" disabled={processing}>Submit Registration</Button>
                                        <button type="button" onClick={() => setShowRegForm(false)} className="text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* Registrations Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-medium text-slate-800">Registrations ({registrationCount})</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Attendee</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Registered At</th>
                                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {event.registrations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center text-slate-400 py-8">No registrations yet.</td>
                                </tr>
                            )}
                            {event.registrations.map(reg => (
                                <tr key={reg.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{reg.attendee_name}</td>
                                    <td className="px-4 py-3 text-slate-500">{reg.attendee_email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${regStatusBadge[reg.status]}`}>
                                            {reg.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {new Date(reg.registered_at).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        {reg.status === 'registered' && (
                                            <button
                                                onClick={() => confirmReg(reg.id)}
                                                className="text-xs text-green-600 hover:text-green-800 font-medium"
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        {(reg.status === 'registered' || reg.status === 'confirmed') && (
                                            <button
                                                onClick={() => attendReg(reg.id)}
                                                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                                            >
                                                Attend
                                            </button>
                                        )}
                                        {reg.status !== 'cancelled' && (
                                            <button
                                                onClick={() => cancelReg(reg.id)}
                                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Cancel
                                            </button>
                                        )}
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

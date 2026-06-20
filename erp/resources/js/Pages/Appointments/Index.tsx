import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface AppointmentType {
    id: number;
    name: string;
}

interface AppointmentSlot {
    id: number;
    start_at: string;
    end_at: string;
    capacity: number;
    booked_count: number;
    type: AppointmentType | null;
}

interface Appointment {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    slot: AppointmentSlot | null;
}

interface Props extends PageProps {
    appointments: {
        data: Appointment[];
        current_page: number;
        last_page: number;
        total: number;
    };
    slots: AppointmentSlot[];
    types: AppointmentType[];
}

const statusBadge: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    no_show:   'bg-gray-100 text-gray-700',
};

const statusLabel: Record<string, string> = {
    pending:   'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    no_show:   'No Show',
};

export default function AppointmentsIndex({ appointments, slots, types }: Props) {
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        appointment_slot_id: '',
        appointment_type_id: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/appointments/book', {
            onSuccess: () => {
                form.reset();
                setShowModal(false);
            },
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout>
            <Head title="Appointments" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    >
                        Book Appointment
                    </button>
                </div>

                {/* Appointments Table */}
                <div className="bg-white rounded-xl shadow">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900">
                            All Appointments <span className="text-sm text-gray-500">({appointments.total})</span>
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {appointments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                            No appointments yet
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.data.map((appt) => (
                                        <tr key={appt.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{appt.customer_name}</div>
                                                <div className="text-xs text-gray-400">{appt.customer_email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {appt.slot?.type?.name ?? '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {appt.slot?.start_at ? formatDate(appt.slot.start_at) : formatDate(appt.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[appt.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {statusLabel[appt.status] ?? appt.status}
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

            {/* Book Appointment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Book Appointment</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type *</label>
                                <select
                                    value={form.data.appointment_type_id}
                                    onChange={(e) => form.setData('appointment_type_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Select type...</option>
                                    {types.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                {form.errors.appointment_type_id && (
                                    <p className="text-red-500 text-xs mt-1">{form.errors.appointment_type_id}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot *</label>
                                <select
                                    value={form.data.appointment_slot_id}
                                    onChange={(e) => form.setData('appointment_slot_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Select slot...</option>
                                    {slots.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.type?.name} — {new Date(s.start_at).toLocaleString()} ({s.booked_count}/{s.capacity})
                                        </option>
                                    ))}
                                </select>
                                {form.errors.appointment_slot_id && (
                                    <p className="text-red-500 text-xs mt-1">{form.errors.appointment_slot_id}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                                    <input
                                        type="text"
                                        value={form.data.customer_name}
                                        onChange={(e) => form.setData('customer_name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                    {form.errors.customer_name && (
                                        <p className="text-red-500 text-xs mt-1">{form.errors.customer_name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email *</label>
                                    <input
                                        type="email"
                                        value={form.data.customer_email}
                                        onChange={(e) => form.setData('customer_email', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                    {form.errors.customer_email && (
                                        <p className="text-red-500 text-xs mt-1">{form.errors.customer_email}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={form.data.customer_phone}
                                    onChange={(e) => form.setData('customer_phone', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {form.processing ? 'Booking...' : 'Book Appointment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

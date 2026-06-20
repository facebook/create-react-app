import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
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
    is_available: boolean;
    type: AppointmentType | null;
    staff_user_id: number | null;
}

interface Props extends PageProps {
    slots: {
        data: AppointmentSlot[];
        current_page: number;
        last_page: number;
        total: number;
    };
    types: AppointmentType[];
}

export default function AppointmentSlotsIndex({ slots, types }: Props) {
    const form = useForm({
        appointment_type_id: '',
        start_at: '',
        end_at: '',
        capacity: 1,
        is_available: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/appointments/slots', {
            onSuccess: () => form.reset(),
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title="Appointment Slots" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Appointment Slots</h1>
                </div>

                {/* Add Slot Form */}
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add Time Slot</h2>
                    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type *</label>
                            <select
                                value={form.data.appointment_type_id}
                                onChange={(e) => form.setData('appointment_type_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start At *</label>
                            <input
                                type="datetime-local"
                                value={form.data.start_at}
                                onChange={(e) => form.setData('start_at', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {form.errors.start_at && (
                                <p className="text-red-500 text-xs mt-1">{form.errors.start_at}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End At *</label>
                            <input
                                type="datetime-local"
                                value={form.data.end_at}
                                onChange={(e) => form.setData('end_at', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {form.errors.end_at && (
                                <p className="text-red-500 text-xs mt-1">{form.errors.end_at}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                            <input
                                type="number"
                                min={1}
                                value={form.data.capacity}
                                onChange={(e) => form.setData('capacity', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {form.processing ? 'Adding...' : 'Add Slot'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Slots Table */}
                <div className="bg-white rounded-xl shadow">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900">
                            All Slots <span className="text-sm text-gray-500">({slots.total})</span>
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {slots.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                            No slots yet
                                        </td>
                                    </tr>
                                ) : (
                                    slots.data.map((slot) => (
                                        <tr key={slot.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {slot.type?.name ?? '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(slot.start_at)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(slot.end_at)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{ width: `${Math.min(100, (slot.booked_count / slot.capacity) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500">{slot.booked_count}/{slot.capacity}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${slot.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {slot.is_available ? 'Available' : 'Unavailable'}
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

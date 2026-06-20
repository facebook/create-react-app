import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    today_count: number;
    pending_count: number;
    confirmed_count: number;
    upcoming_week: number;
}

interface Props extends PageProps {
    stats: Stats;
}

export default function AppointmentsDashboard({ stats }: Props) {
    return (
        <AppLayout>
            <Head title="Appointments Dashboard" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Appointments Dashboard</h1>
                    <div className="flex gap-3">
                        <Link
                            href="/appointments/types"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                            Appointment Types
                        </Link>
                        <Link
                            href="/appointments/slots"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                        >
                            Manage Slots
                        </Link>
                        <Link
                            href="/appointments"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                        >
                            All Appointments
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <span className="text-4xl font-bold text-blue-600">{stats.today_count}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Today's Appointments</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <span className="text-4xl font-bold text-yellow-600">{stats.pending_count}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Pending</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <span className="text-4xl font-bold text-green-600">{stats.confirmed_count}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Confirmed</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <span className="text-4xl font-bold text-purple-600">{stats.upcoming_week}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Upcoming (7 days)</span>
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Navigation</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link
                            href="/appointments/types"
                            className="flex flex-col items-center p-6 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition"
                        >
                            <span className="text-3xl mb-2">📋</span>
                            <span className="text-sm font-medium text-gray-700">Appointment Types</span>
                            <span className="text-xs text-gray-400 mt-1">Manage service types</span>
                        </Link>
                        <Link
                            href="/appointments/slots"
                            className="flex flex-col items-center p-6 border-2 border-dashed border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition"
                        >
                            <span className="text-3xl mb-2">🗓️</span>
                            <span className="text-sm font-medium text-gray-700">Time Slots</span>
                            <span className="text-xs text-gray-400 mt-1">Schedule availability</span>
                        </Link>
                        <Link
                            href="/appointments"
                            className="flex flex-col items-center p-6 border-2 border-dashed border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition"
                        >
                            <span className="text-3xl mb-2">👥</span>
                            <span className="text-sm font-medium text-gray-700">All Appointments</span>
                            <span className="text-xs text-gray-400 mt-1">Manage bookings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

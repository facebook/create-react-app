import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    currently_in: number;
    expected_today: number;
    checked_in_today: number;
    checked_out_today: number;
    no_shows_today: number;
    stations_count: number;
}

interface RecentVisitor {
    id: number;
    visitor_name: string;
    visitor_company: string | null;
    status: string;
    check_in_at: string | null;
    host: { id: number; name: string } | null;
    station: { id: number; name: string } | null;
}

interface Props extends PageProps {
    stats: Stats;
    recentVisitors: RecentVisitor[];
}

const statusBadge: Record<string, string> = {
    expected:    'bg-blue-100 text-blue-700',
    checked_in:  'bg-green-100 text-green-700',
    checked_out: 'bg-gray-100 text-gray-700',
    no_show:     'bg-red-100 text-red-700',
};

const statusLabel: Record<string, string> = {
    expected:    'Expected',
    checked_in:  'Checked In',
    checked_out: 'Checked Out',
    no_show:     'No Show',
};

export default function FrontdeskDashboard({ stats, recentVisitors }: Props) {
    return (
        <AppLayout>
            <Head title="Frontdesk Dashboard" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Frontdesk Dashboard</h1>
                    <div className="flex gap-3">
                        <Link
                            href="/frontdesk/check-in"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                        >
                            Walk-In Check In
                        </Link>
                        <Link
                            href="/frontdesk/check-in"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                            Pre-Register Visitor
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center col-span-2 md:col-span-1">
                        <span className="text-5xl font-bold text-green-600">{stats.currently_in}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Currently Inside</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                        <span className="text-3xl font-bold text-blue-600">{stats.expected_today}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Expected Today</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                        <span className="text-3xl font-bold text-indigo-600">{stats.checked_in_today}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Checked In Today</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                        <span className="text-3xl font-bold text-gray-600">{stats.checked_out_today}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Checked Out Today</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                        <span className="text-3xl font-bold text-red-600">{stats.no_shows_today}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">No Shows</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                        <span className="text-3xl font-bold text-purple-600">{stats.stations_count}</span>
                        <span className="mt-2 text-sm text-gray-500 text-center">Stations</span>
                    </div>
                </div>

                {/* Recent Visitors */}
                <div className="bg-white rounded-xl shadow">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900">Recent Visitors</h2>
                        <Link href="/frontdesk/visitors" className="text-sm text-blue-600 hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentVisitors.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                            No recent visitors
                                        </td>
                                    </tr>
                                ) : (
                                    recentVisitors.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{v.visitor_name}</div>
                                                {v.visitor_company && (
                                                    <div className="text-xs text-gray-400">{v.visitor_company}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {v.host?.name ?? '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {v.check_in_at
                                                    ? new Date(v.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[v.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {statusLabel[v.status] ?? v.status}
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

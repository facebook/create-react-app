import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
}

interface Station {
    id: number;
    name: string;
}

interface VisitorLog {
    id: number;
    visitor_name: string;
    visitor_company: string | null;
    visit_purpose: string | null;
    status: string;
    check_in_at: string | null;
    check_out_at: string | null;
    host: User | null;
    station: Station | null;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    date: string;
    status: string | null;
}

interface Props extends PageProps {
    visitors: PaginatedData<VisitorLog>;
    filters: Filters;
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

function durationLabel(checkIn: string | null, checkOut: string | null): string {
    if (!checkIn || !checkOut) return '—';
    const mins = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function VisitorsIndex({ visitors, filters }: Props) {
    const applyFilter = (key: string, value: string) => {
        router.get('/frontdesk/visitors', { ...filters, [key]: value }, { preserveScroll: true });
    };

    const handleCheckOut = (id: number) => {
        router.post(`/frontdesk/visitors/${id}/check-out`, {});
    };

    const handleNoShow = (id: number) => {
        router.post(`/frontdesk/visitors/${id}/no-show`, {});
    };

    return (
        <AppLayout>
            <Head title="Visitors" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Visitors</h1>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => applyFilter('date', e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <select
                            value={filters.status ?? ''}
                            onChange={(e) => applyFilter('status', e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="expected">Expected</option>
                            <option value="checked_in">Checked In</option>
                            <option value="checked_out">Checked Out</option>
                            <option value="no_show">No Show</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {visitors.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-10 text-center text-gray-400">
                                            No visitors found.
                                        </td>
                                    </tr>
                                ) : (
                                    visitors.data.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{v.visitor_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{v.visitor_company ?? '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{v.host?.name ?? '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{v.visit_purpose ?? '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{v.station?.name ?? '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[v.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {statusLabel[v.status] ?? v.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {v.check_in_at ? new Date(v.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {v.check_out_at ? new Date(v.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {durationLabel(v.check_in_at, v.check_out_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {v.status === 'checked_in' && (
                                                        <button
                                                            onClick={() => handleCheckOut(v.id)}
                                                            className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition"
                                                        >
                                                            Check Out
                                                        </button>
                                                    )}
                                                    {v.status === 'expected' && (
                                                        <button
                                                            onClick={() => handleNoShow(v.id)}
                                                            className="px-2.5 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 transition"
                                                        >
                                                            No Show
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {visitors.last_page > 1 && (
                        <div className="px-6 py-3 border-t border-gray-100 flex justify-center gap-1">
                            {visitors.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-40`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

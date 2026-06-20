import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Agent {
    id: number;
    name: string;
}

interface Channel {
    id: number;
    name: string;
}

interface Session {
    id: number;
    visitor_name: string | null;
    visitor_email: string | null;
    status: 'open' | 'assigned' | 'resolved' | 'missed';
    channel: Channel | null;
    agent: Agent | null;
    rating: number | null;
    started_at: string | null;
    ended_at: string | null;
    last_message_at: string | null;
}

interface PaginatedSessions {
    data: Session[];
    current_page: number;
    last_page: number;
}

interface Props extends PageProps {
    sessions: PaginatedSessions;
    active_status: string | null;
}

const statusColors: Record<string, string> = {
    open:     'bg-blue-100 text-blue-700',
    assigned: 'bg-indigo-100 text-indigo-700',
    resolved: 'bg-green-100 text-green-700',
    missed:   'bg-red-100 text-red-700',
};

const statusTabs = [
    { key: '', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'missed', label: 'Missed' },
];

function StarDisplay({ rating }: { rating: number | null }) {
    if (!rating) return <span className="text-slate-400 text-xs">—</span>;
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`h-3 w-3 ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.376 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.376 2.454c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.632 9.394c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.951-.69L9.049 2.927z" />
                </svg>
            ))}
        </div>
    );
}

function calcDuration(started: string | null, ended: string | null): string {
    if (!started || !ended) return '—';
    const diff = Math.round((new Date(ended).getTime() - new Date(started).getTime()) / 60000);
    return `${diff}m`;
}

export default function SessionsIndex({ sessions, active_status }: Props) {
    function filterByStatus(status: string) {
        router.get('/live-chat/sessions', status ? { status } : {}, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Chat Sessions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Chat Sessions</h1>
                </div>

                <div className="flex gap-1 border-b border-slate-200">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => filterByStatus(tab.key)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                (active_status ?? '') === tab.key
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Visitor</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Channel</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Agent</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Duration</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sessions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                                            No sessions found.
                                        </td>
                                    </tr>
                                )}
                                {sessions.data.map((session) => (
                                    <tr
                                        key={session.id}
                                        className="hover:bg-slate-50 cursor-pointer"
                                        onClick={() => router.get(`/live-chat/sessions/${session.id}`)}
                                    >
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-slate-900">{session.visitor_name ?? 'Anonymous'}</p>
                                            {session.visitor_email && (
                                                <p className="text-xs text-slate-500">{session.visitor_email}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{session.channel?.name ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[session.status] ?? ''}`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{session.agent?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {calcDuration(session.started_at, session.ended_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StarDisplay rating={session.rating} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {sessions.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                            <span className="text-sm text-slate-500">Page {sessions.current_page} of {sessions.last_page}</span>
                            <div className="flex gap-2">
                                {sessions.current_page > 1 && (
                                    <Link
                                        href={`/live-chat/sessions?page=${sessions.current_page - 1}${active_status ? `&status=${active_status}` : ''}`}
                                        className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {sessions.current_page < sessions.last_page && (
                                    <Link
                                        href={`/live-chat/sessions?page=${sessions.current_page + 1}${active_status ? `&status=${active_status}` : ''}`}
                                        className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

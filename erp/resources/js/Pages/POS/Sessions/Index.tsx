import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Link } from '@inertiajs/react';

interface Session {
    id: number;
    name: string;
    status: 'open' | 'closed';
    warehouse: { id: number; name: string } | null;
    opened_by: { id: number; name: string } | null;
    closed_by: { id: number; name: string } | null;
    opened_at: string | null;
    closed_at: string | null;
    total_sales: number;
}

interface PaginatedSessions {
    data: Session[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    sessions: PaginatedSessions;
}

export default function SessionsIndex({ sessions }: Props) {
    return (
        <AppLayout title="POS Sessions">
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">POS Sessions</h1>
                    <Link href="/pos/sessions/create">
                        <Button>New Session</Button>
                    </Link>
                </div>

                <div className="rounded-lg bg-white shadow-sm border border-slate-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Warehouse</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Opened By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Opened At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Total Sales</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Closed At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {sessions.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No sessions found</td>
                                </tr>
                            )}
                            {sessions.data.map((session) => (
                                <tr key={session.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                                        <Link href={session.status === 'open' ? `/pos/sessions/${session.id}` : `/pos/sessions/${session.id}/z-report`}>
                                            {session.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{session.warehouse?.name ?? '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${session.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {session.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{session.opened_by?.name ?? '—'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {session.opened_at ? new Date(session.opened_at).toLocaleString() : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">${(session.total_sales ?? 0).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {session.closed_at ? new Date(session.closed_at).toLocaleString() : '—'}
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

import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';

interface AuditLogEntry {
    id: number;
    event: string;
    action: string;
    model: string;
    model_id: number;
    auditable_label: string | null;
    user_name: string;
    user: { name: string; email: string } | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address?: string;
    module?: string;
    created_at: string;
    created_at_raw: string;
}

interface Props extends PageProps {
    logs: Paginator<AuditLogEntry>;
    filters: {
        event?: string;
        model?: string;
        user_id?: string;
        date_from?: string;
        date_to?: string;
    };
    users: { id: number; name: string }[];
}

const EVENT_COLORS: Record<string, string> = {
    created: 'bg-green-100 text-green-700',
    updated: 'bg-blue-100 text-blue-700',
    deleted: 'bg-red-100 text-red-600',
    login:   'bg-purple-100 text-purple-700',
    logout:  'bg-slate-100 text-slate-600',
};

function ValueDiff({
    old: oldVal,
    nw,
}: {
    old: Record<string, unknown> | null;
    nw: Record<string, unknown> | null;
}) {
    const keys = Array.from(new Set([...Object.keys(oldVal ?? {}), ...Object.keys(nw ?? {})]));
    if (keys.length === 0) return null;

    return (
        <div className="mt-2 space-y-1">
            {keys.map((k) => (
                <div key={k} className="text-xs">
                    <span className="font-medium text-slate-600">{k}:</span>{' '}
                    {oldVal?.[k] !== undefined && (
                        <span className="text-red-600 line-through mr-1">{String(oldVal[k])}</span>
                    )}
                    {nw?.[k] !== undefined && (
                        <span className="text-green-700">{String(nw[k])}</span>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function AuditLogIndex({ logs, filters, users }: Props) {
    const [event, setEvent]       = useState(filters.event ?? '');
    const [model, setModel]       = useState(filters.model ?? '');
    const [userId, setUserId]     = useState(filters.user_id ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo]     = useState(filters.date_to ?? '');
    const [expanded, setExpanded] = useState<number | null>(null);

    function applyFilters(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            '/admin/audit-log',
            {
                event:     event || undefined,
                model:     model || undefined,
                user_id:   userId || undefined,
                date_from: dateFrom || undefined,
                date_to:   dateTo || undefined,
            },
            { preserveState: true, replace: true }
        );
    }

    function clearFilters() {
        setEvent(''); setModel(''); setUserId(''); setDateFrom(''); setDateTo('');
        router.get('/admin/audit-log', {}, { replace: true });
    }

    const hasFilters = !!(filters.event || filters.model || filters.user_id || filters.date_from || filters.date_to);

    return (
        <AppLayout>
            <Head title="Audit Log" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Audit Log</h1>
                    <p className="text-sm text-slate-500 mt-1">{logs.total} entries</p>
                </div>

                {/* Filters */}
                <form
                    onSubmit={applyFilters}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-end gap-3"
                >
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Event</label>
                        <select
                            value={event}
                            onChange={(e) => setEvent(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">All events</option>
                            <option value="created">Created</option>
                            <option value="updated">Updated</option>
                            <option value="deleted">Deleted</option>
                            <option value="login">Login</option>
                            <option value="logout">Logout</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">User</label>
                        <select
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">All users</option>
                            {users.map((u) => (
                                <option key={u.id} value={String(u.id)}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Model</label>
                        <input
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="e.g. Invoice"
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none w-32"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <Button type="submit" variant="primary" size="sm">Apply</Button>
                    {hasFilters && (
                        <Button type="button" variant="secondary" size="sm" onClick={clearFilters}>
                            Clear
                        </Button>
                    )}
                </form>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Event</th>
                                <th className="px-4 py-2 text-left font-medium">Model / Record</th>
                                <th className="px-4 py-2 text-left font-medium">User</th>
                                <th className="px-4 py-2 text-left font-medium">IP</th>
                                <th className="px-4 py-2 text-left font-medium">When</th>
                                <th className="px-4 py-2 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.data.map((log) => (
                                <>
                                    <tr
                                        key={log.id}
                                        className="hover:bg-slate-50 cursor-pointer"
                                        onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                                    >
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${EVENT_COLORS[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {log.model}
                                            {log.auditable_label
                                                ? <span className="text-slate-500 font-normal"> — {log.auditable_label}</span>
                                                : <span className="text-slate-400 font-normal"> #{log.model_id}</span>
                                            }
                                            {log.module && (
                                                <span className="ml-2 text-xs text-slate-400">({log.module})</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{log.user_name}</td>
                                        <td className="px-4 py-3 text-xs text-slate-400">{log.ip_address ?? '—'}</td>
                                        <td
                                            className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs"
                                            title={log.created_at_raw}
                                        >
                                            {log.created_at}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/admin/audit-log/${log.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                    {expanded === log.id && (
                                        <tr key={`${log.id}-detail`} className="bg-slate-50">
                                            <td colSpan={6} className="px-4 py-3">
                                                <ValueDiff old={log.old_values} nw={log.new_values} />
                                                {log.ip_address && (
                                                    <p className="text-xs text-slate-400 mt-2">IP: {log.ip_address}</p>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                            {logs.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No audit log entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination paginator={logs} />
                </div>
            </div>
        </AppLayout>
    );
}

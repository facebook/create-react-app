import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { AuditLog } from '@/types/core';

interface Props extends PageProps {
    logs: Paginator<AuditLog>;
    filters: {
        action?: string;
        module?: string;
        user_id?: string;
    };
}

const ACTION_COLORS: Record<string, string> = {
    created:  'bg-green-100 text-green-700',
    updated:  'bg-blue-100 text-blue-700',
    deleted:  'bg-red-100 text-red-700',
    login:    'bg-purple-100 text-purple-700',
    logout:   'bg-slate-100 text-slate-700',
};

function shortType(type: string | null): string {
    if (!type) return '—';
    return type.split('\\').pop() ?? type;
}

export default function AuditLogsIndex({ logs, filters }: Props) {
    const { data, setData, get } = useForm({
        action: filters.action ?? '',
        module: filters.module ?? '',
    });

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        get('/core/audit-logs');
    }

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <AppLayout>
            <Head title="Audit Log" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Audit Log</h1>
                    <p className="text-sm text-slate-500 mt-1">System-wide activity trail — {logs.total} entries</p>
                </div>

                <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Action</label>
                        <select value={data.action} onChange={(e) => setData('action', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">All actions</option>
                            <option value="created">Created</option>
                            <option value="updated">Updated</option>
                            <option value="deleted">Deleted</option>
                            <option value="login">Login</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Module</label>
                        <input type="text" placeholder="e.g. Finance" value={data.module}
                            onChange={(e) => setData('module', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none w-36" />
                    </div>
                    <button type="submit"
                        className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                        Filter
                    </button>
                    {hasFilters && (
                        <Link href="/core/audit-logs" className="text-sm text-slate-500 hover:text-slate-700">Clear</Link>
                    )}
                </form>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">ID</th>
                                <th className="px-4 py-2 text-left font-medium">User</th>
                                <th className="px-4 py-2 text-left font-medium">Action</th>
                                <th className="px-4 py-2 text-left font-medium">Module</th>
                                <th className="px-4 py-2 text-left font-medium">Record</th>
                                <th className="px-4 py-2 text-left font-medium">IP</th>
                                <th className="px-4 py-2 text-left font-medium">Date</th>
                                <th className="px-4 py-2 text-left font-medium"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.data.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No audit entries found.</td></tr>
                            ) : logs.data.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50 align-top">
                                    <td className="px-4 py-3 text-slate-400 text-xs">#{entry.id}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">
                                        {entry.user?.name ?? <span className="text-slate-400">System</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_COLORS[entry.action] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {entry.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{entry.module ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {entry.auditable_label
                                            ? <span>{entry.auditable_label} <span className="text-slate-400 text-xs">({shortType(entry.auditable_type)})</span></span>
                                            : shortType(entry.auditable_type)
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400">{entry.ip_address ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                                        {new Date(entry.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/core/audit-logs/${entry.id}`} className="text-xs text-indigo-600 hover:underline">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {logs.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {logs.prev_page_url && (
                            <Link href={logs.prev_page_url} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                                &larr; Previous
                            </Link>
                        )}
                        <span className="px-3 py-1.5 text-sm text-slate-500">Page {logs.current_page} of {logs.last_page}</span>
                        {logs.next_page_url && (
                            <Link href={logs.next_page_url} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                                Next &rarr;
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

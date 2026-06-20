import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface LogUser {
    id: number;
    name: string;
    email: string;
}

interface AuditLogDetail {
    id: number;
    event: string;
    action: string;
    auditable_type: string | null;
    auditable_id: number | null;
    auditable_label: string | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    url: string | null;
    module: string | null;
    user: LogUser | null;
    created_at: string;
}

interface Props extends PageProps {
    log: AuditLogDetail;
}

const EVENT_COLORS: Record<string, string> = {
    created: 'bg-green-100 text-green-700',
    updated: 'bg-blue-100 text-blue-700',
    deleted: 'bg-red-100 text-red-600',
    login:   'bg-purple-100 text-purple-700',
    logout:  'bg-slate-100 text-slate-600',
};

function shortType(type: string | null): string {
    if (!type) return '—';
    return type.split('\\').pop() ?? type;
}

function DiffTable({
    oldValues,
    newValues,
}: {
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
}) {
    if (!oldValues && !newValues) return null;

    const allKeys = Array.from(
        new Set([...Object.keys(oldValues ?? {}), ...Object.keys(newValues ?? {})])
    );

    // Only show keys where value actually changed
    const changedKeys = allKeys.filter((k) => {
        const o = JSON.stringify((oldValues ?? {})[k]);
        const n = JSON.stringify((newValues ?? {})[k]);
        return o !== n;
    });

    const keysToShow = changedKeys.length > 0 ? changedKeys : allKeys;

    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Old Values
                </h3>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
                    {keysToShow.map((k) => (
                        <div key={k}>
                            <span className="text-xs font-medium text-slate-600">{k}: </span>
                            <span className="text-xs text-red-700">
                                {(oldValues ?? {})[k] !== undefined
                                    ? JSON.stringify((oldValues ?? {})[k])
                                    : <em className="text-slate-400">—</em>}
                            </span>
                        </div>
                    ))}
                    {keysToShow.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No previous values</p>
                    )}
                </div>
            </div>

            <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    New Values
                </h3>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
                    {keysToShow.map((k) => (
                        <div key={k}>
                            <span className="text-xs font-medium text-slate-600">{k}: </span>
                            <span className="text-xs text-green-700">
                                {(newValues ?? {})[k] !== undefined
                                    ? JSON.stringify((newValues ?? {})[k])
                                    : <em className="text-slate-400">—</em>}
                            </span>
                        </div>
                    ))}
                    {keysToShow.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No new values</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AuditLogShow({ log }: Props) {
    return (
        <AppLayout>
            <Head title={`Audit Log #${log.id}`} />
            <div className="max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/admin/audit-log" className="text-sm text-indigo-600 hover:underline">
                        &larr; Back to Audit Log
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold text-slate-900">Audit Log #{log.id}</h1>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${EVENT_COLORS[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                        {log.action}
                    </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5">
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Timestamp</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {new Date(log.created_at).toLocaleString()}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">User</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {log.user ? (
                                    <>
                                        <span>{log.user.name}</span>
                                        <span className="ml-1 text-xs text-slate-400">({log.user.email})</span>
                                    </>
                                ) : (
                                    <span className="text-slate-400">System</span>
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Record Type</dt>
                            <dd className="mt-1 text-sm text-slate-900">{shortType(log.auditable_type)}</dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Record</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {log.auditable_label ?? (log.auditable_id ? `#${log.auditable_id}` : '—')}
                            </dd>
                        </div>

                        {log.module && (
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Module</dt>
                                <dd className="mt-1 text-sm text-slate-900">{log.module}</dd>
                            </div>
                        )}

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">IP Address</dt>
                            <dd className="mt-1 text-sm text-slate-900">{log.ip_address ?? '—'}</dd>
                        </div>

                        {log.url && (
                            <div className="col-span-2">
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">URL</dt>
                                <dd className="mt-1 text-xs text-slate-500 break-all">{log.url}</dd>
                            </div>
                        )}

                        {log.user_agent && (
                            <div className="col-span-2">
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">User Agent</dt>
                                <dd className="mt-1 text-xs text-slate-500 break-all">{log.user_agent}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {(log.old_values || log.new_values) && (
                    <div className="space-y-2">
                        <h2 className="text-base font-medium text-slate-900">Changes</h2>
                        <DiffTable oldValues={log.old_values} newValues={log.new_values} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

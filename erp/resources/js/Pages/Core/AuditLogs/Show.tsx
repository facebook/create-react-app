import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import type { AuditLog } from '@/types/core';

interface Props extends PageProps {
    log: AuditLog;
}

function shortType(type: string | null): string {
    if (!type) return '—';
    return type.split('\\').pop() ?? type;
}

export default function AuditLogShow({ log }: Props) {
    return (
        <AppLayout>
            <Head title={`Audit Log #${log.id}`} />
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-4">
                    <Link href="/core/audit-logs" className="text-sm text-indigo-600 hover:underline">&larr; Back to Audit Logs</Link>
                </div>

                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Audit Log #{log.id}</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {new Date(log.created_at).toLocaleString()}
                    </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
                    <dl className="px-6 py-4 grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">User</dt>
                            <dd className="mt-1 text-sm text-slate-900">{log.user?.name ?? <span className="text-slate-400">System</span>}</dd>
                            {log.user && <dd className="text-xs text-slate-400">{log.user.email}</dd>}
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Action</dt>
                            <dd className="mt-1">
                                <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700">
                                    {log.action}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Module</dt>
                            <dd className="mt-1 text-sm text-slate-900">{log.module ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Record Type</dt>
                            <dd className="mt-1 text-sm text-slate-900">{shortType(log.auditable_type)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Record ID</dt>
                            <dd className="mt-1 text-sm text-slate-900">{log.auditable_id ? `#${log.auditable_id}` : '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Record Label</dt>
                            <dd className="mt-1 text-sm text-slate-900">{log.auditable_label ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">IP Address</dt>
                            <dd className="mt-1 text-sm text-slate-900">{log.ip_address ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">User Agent</dt>
                            <dd className="mt-1 text-xs text-slate-500 break-all">{log.user_agent ?? '—'}</dd>
                        </div>
                        {log.url && (
                            <div className="col-span-2">
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">URL</dt>
                                <dd className="mt-1 text-xs text-slate-500 break-all">{log.url}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Change Summary</dt>
                            <dd className="mt-1 text-sm text-slate-900">{log.change_summary}</dd>
                        </div>
                    </dl>
                </div>

                {(log.old_values || log.new_values) && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {log.old_values && (
                            <div>
                                <h2 className="text-sm font-medium text-slate-700 mb-2">Old Values</h2>
                                <pre className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 overflow-auto max-h-64">
                                    {JSON.stringify(log.old_values, null, 2)}
                                </pre>
                            </div>
                        )}
                        {log.new_values && (
                            <div>
                                <h2 className="text-sm font-medium text-slate-700 mb-2">New Values</h2>
                                <pre className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 overflow-auto max-h-64">
                                    {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

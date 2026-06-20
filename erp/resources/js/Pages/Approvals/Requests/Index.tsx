import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface ApprovalRequest {
    id: number;
    entity_title: string;
    entity_type: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    current_step: number;
    total_steps: number;
    created_at: string;
    workflow?: { name: string } | null;
    requested_by?: { id: number; name: string } | null;
}

interface PaginatorMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
}

interface Paginator {
    data: ApprovalRequest[];
    meta: PaginatorMeta;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    requests: Paginator;
    filters: { status?: string; entity_type?: string };
}

const STATUS_COLORS: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    approved:  'bg-green-100 text-green-800',
    rejected:  'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-600',
};

const ENTITY_LABELS: Record<string, string> = {
    purchase_order:      'Purchase Order',
    expense:             'Expense',
    leave_request:       'Leave Request',
    bill:                'Bill',
    manufacturing_order: 'Mfg Order',
};

const STATUS_OPTIONS = ['', 'pending', 'approved', 'rejected', 'cancelled'];
const ENTITY_OPTIONS = ['', 'purchase_order', 'expense', 'leave_request', 'bill', 'manufacturing_order'];

export default function RequestsIndex({ requests, filters }: Props) {
    function setFilter(key: string, value: string) {
        router.get('/approvals/requests', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Approval Requests" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Approval Requests</h1>
                        <p className="text-sm text-slate-500 mt-1">{requests.meta.total} total requests</p>
                    </div>
                    <Link href="/approvals/my-pending" className="text-sm text-indigo-600 hover:underline">My Pending →</Link>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                        <select
                            value={filters.status ?? ''}
                            onChange={(e) => setFilter('status', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.filter(Boolean).map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Entity Type</label>
                        <select
                            value={filters.entity_type ?? ''}
                            onChange={(e) => setFilter('entity_type', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">All Types</option>
                            {ENTITY_OPTIONS.filter(Boolean).map((t) => (
                                <option key={t} value={t}>{ENTITY_LABELS[t] ?? t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Requested By</th>
                                <th className="px-6 py-3">Progress</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No requests found</td>
                                </tr>
                            ) : requests.data.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{req.entity_title}</td>
                                    <td className="px-6 py-3">
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                            {ENTITY_LABELS[req.entity_type] ?? req.entity_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">{req.requested_by?.name ?? '—'}</td>
                                    <td className="px-6 py-3 text-slate-600">{req.current_step}/{req.total_steps}</td>
                                    <td className="px-6 py-3 text-slate-500 text-xs">{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-3">
                                        <Link href={`/approvals/requests/${req.id}`} className="text-indigo-600 hover:underline text-xs">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {requests.meta.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {requests.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={`px-3 py-1.5 text-xs rounded-md border ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'} disabled:opacity-40`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

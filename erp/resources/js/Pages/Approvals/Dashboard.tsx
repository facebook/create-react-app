import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
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

interface Stats {
    pending_requests: number;
    approved_today: number;
    rejected_today: number;
    my_pending: number;
}

interface Props extends PageProps {
    stats: Stats;
    recentRequests: ApprovalRequest[];
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

export default function ApprovalsDashboard({ stats, recentRequests }: Props) {
    return (
        <AppLayout>
            <Head title="Approvals Dashboard" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Approvals</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage approval workflows and requests</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/approvals/my-pending">
                            <Button variant="secondary">My Pending</Button>
                        </Link>
                        <Link href="/approvals/workflows/create">
                            <Button>New Workflow</Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Pending Requests</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats.pending_requests}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Approved Today</p>
                        <p className="mt-2 text-3xl font-bold text-green-600">{stats.approved_today}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Rejected Today</p>
                        <p className="mt-2 text-3xl font-bold text-red-600">{stats.rejected_today}</p>
                    </div>
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
                        <p className="text-sm font-medium text-indigo-600">My Pending</p>
                        <p className="mt-2 text-3xl font-bold text-indigo-700">{stats.my_pending}</p>
                        <Link href="/approvals/my-pending" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">View all →</Link>
                    </div>
                </div>

                {/* Recent Requests */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-900">Recent Requests</h2>
                        <Link href="/approvals/requests" className="text-sm text-indigo-600 hover:underline">View all</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Requested By</th>
                                    <th className="px-6 py-3">Step</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No recent requests</td>
                                    </tr>
                                ) : recentRequests.map((req) => (
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
                                        <td className="px-6 py-3">
                                            <Link href={`/approvals/requests/${req.id}`} className="text-indigo-600 hover:underline text-xs">View</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
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

interface Props extends PageProps {
    requests: ApprovalRequest[];
}

const ENTITY_LABELS: Record<string, string> = {
    purchase_order:      'Purchase Order',
    expense:             'Expense',
    leave_request:       'Leave Request',
    bill:                'Bill',
    manufacturing_order: 'Mfg Order',
};

function QuickActions({ requestId }: { requestId: number }) {
    const approveForm = useForm({ comments: '' });
    const rejectForm = useForm({ reason: '' });

    return (
        <div className="flex gap-2">
            <button
                onClick={() => {
                    if (confirm('Approve this request?')) {
                        approveForm.post(`/approvals/requests/${requestId}/approve`);
                    }
                }}
                disabled={approveForm.processing}
                className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
                Approve
            </button>
            <button
                onClick={() => {
                    const reason = prompt('Reason for rejection:');
                    if (reason) {
                        rejectForm.setData('reason', reason);
                        rejectForm.post(`/approvals/requests/${requestId}/reject`);
                    }
                }}
                disabled={rejectForm.processing}
                className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
                Reject
            </button>
            <Link href={`/approvals/requests/${requestId}`} className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
                View
            </Link>
        </div>
    );
}

export default function MyPending({ requests }: Props) {
    return (
        <AppLayout>
            <Head title="My Pending Approvals" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">My Pending Approvals</h1>
                        <p className="text-sm text-slate-500 mt-1">{requests.length} request{requests.length !== 1 ? 's' : ''} waiting for your action</p>
                    </div>
                    <Link href="/approvals/requests" className="text-sm text-indigo-600 hover:underline">All Requests →</Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Requested By</th>
                                <th className="px-6 py-3">Step</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                        No pending approvals — you're all caught up!
                                    </td>
                                </tr>
                            ) : requests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{req.entity_title}</td>
                                    <td className="px-6 py-3">
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                            {ENTITY_LABELS[req.entity_type] ?? req.entity_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">{req.requested_by?.name ?? '—'}</td>
                                    <td className="px-6 py-3 text-slate-600">{req.current_step}/{req.total_steps}</td>
                                    <td className="px-6 py-3 text-slate-500 text-xs">{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-3">
                                        <QuickActions requestId={req.id} />
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

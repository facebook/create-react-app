import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ApprovalAction {
    id: number;
    step_number: number;
    action: 'approved' | 'rejected' | 'delegated';
    comments: string | null;
    acted_at: string;
    actor: { id: number; name: string } | null;
}

interface Step {
    id: number;
    step_number: number;
    name: string;
    approver_id: number | null;
    approver_role: string | null;
    is_required: boolean;
    approver: { id: number; name: string } | null;
}

interface Workflow {
    id: number;
    name: string;
    steps: Step[];
}

interface ApprovalRequest {
    id: number;
    entity_title: string;
    entity_type: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    current_step: number;
    total_steps: number;
    rejection_reason: string | null;
    created_at: string;
    approved_at: string | null;
    rejected_at: string | null;
    workflow: Workflow | null;
    requested_by: { id: number; name: string } | null;
    actions: ApprovalAction[];
}

interface Props extends PageProps {
    approvalRequest: ApprovalRequest;
    canApprove: boolean;
    auth: { user: { id: number } };
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
    manufacturing_order: 'Manufacturing Order',
};

export default function RequestShow({ approvalRequest: req, canApprove, auth }: Props) {
    const approveForm = useForm({ comments: '' });
    const rejectForm = useForm({ reason: '' });

    function handleApprove(e: React.FormEvent) {
        e.preventDefault();
        approveForm.post(`/approvals/requests/${req.id}/approve`);
    }

    function handleReject(e: React.FormEvent) {
        e.preventDefault();
        rejectForm.post(`/approvals/requests/${req.id}/reject`);
    }

    function handleCancel() {
        if (confirm('Cancel this approval request?')) {
            useForm({}).post(`/approvals/requests/${req.id}/cancel`);
        }
    }

    const actionForStep = (stepNumber: number) =>
        req.actions.find((a) => a.step_number === stepNumber);

    const isRequester = auth.user.id === req.requested_by?.id;

    return (
        <AppLayout>
            <Head title={req.entity_title} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/approvals/requests" className="text-sm text-slate-500 hover:text-slate-700">Requests</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm text-slate-700">{req.entity_title}</span>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{req.entity_title}</h1>
                        <div className="mt-2 flex gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                {ENTITY_LABELS[req.entity_type] ?? req.entity_type}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </span>
                        </div>
                    </div>
                    {req.status === 'pending' && isRequester && (
                        <form method="POST" action={`/approvals/requests/${req.id}/cancel`} onSubmit={(e) => { e.preventDefault(); handleCancel(); }}>
                            <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>Cancel Request</Button>
                        </form>
                    )}
                </div>

                {/* Info */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <dt className="font-medium text-slate-500">Requested By</dt>
                            <dd className="text-slate-900">{req.requested_by?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-slate-500">Submitted</dt>
                            <dd className="text-slate-900">{new Date(req.created_at).toLocaleString()}</dd>
                        </div>
                        {req.approved_at && (
                            <div>
                                <dt className="font-medium text-slate-500">Approved At</dt>
                                <dd className="text-green-700">{new Date(req.approved_at).toLocaleString()}</dd>
                            </div>
                        )}
                        {req.rejected_at && (
                            <div>
                                <dt className="font-medium text-slate-500">Rejected At</dt>
                                <dd className="text-red-700">{new Date(req.rejected_at).toLocaleString()}</dd>
                            </div>
                        )}
                        {req.rejection_reason && (
                            <div className="col-span-2">
                                <dt className="font-medium text-slate-500">Rejection Reason</dt>
                                <dd className="text-red-700">{req.rejection_reason}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Steps Progress */}
                {req.workflow && req.workflow.steps.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Approval Progress</h2>
                        <ol className="space-y-3">
                            {req.workflow.steps.map((step) => {
                                const action = actionForStep(step.step_number);
                                const isCurrent = req.status === 'pending' && step.step_number === req.current_step;
                                const isCompleted = action !== undefined;

                                return (
                                    <li key={step.id} className={`flex gap-4 rounded-md p-3 ${isCurrent ? 'bg-indigo-50 border border-indigo-200' : isCompleted ? 'bg-green-50 border border-green-100' : 'bg-slate-50 border border-slate-100'}`}>
                                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isCurrent ? 'bg-indigo-600 text-white' : isCompleted ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                                            {step.step_number}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900">{step.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {step.approver ? step.approver.name : step.approver_role ? `Role: ${step.approver_role}` : 'Any approver'}
                                            </p>
                                            {action && (
                                                <p className={`text-xs mt-1 font-medium ${action.action === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                                                    {action.action.charAt(0).toUpperCase() + action.action.slice(1)} by {action.actor?.name ?? '—'} on {new Date(action.acted_at).toLocaleDateString()}
                                                    {action.comments && ` — "${action.comments}"`}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                )}

                {/* Approve / Reject Actions */}
                {canApprove && req.status === 'pending' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <h3 className="text-sm font-semibold text-green-900 mb-3">Approve</h3>
                            <form onSubmit={handleApprove} className="space-y-3">
                                <textarea
                                    value={approveForm.data.comments}
                                    onChange={(e) => approveForm.setData('comments', e.target.value)}
                                    placeholder="Optional comments…"
                                    rows={3}
                                    className="w-full rounded-md border border-green-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                                />
                                <Button type="submit" disabled={approveForm.processing} className="w-full">
                                    Approve
                                </Button>
                            </form>
                        </div>

                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <h3 className="text-sm font-semibold text-red-900 mb-3">Reject</h3>
                            <form onSubmit={handleReject} className="space-y-3">
                                <textarea
                                    value={rejectForm.data.reason}
                                    onChange={(e) => rejectForm.setData('reason', e.target.value)}
                                    placeholder="Reason for rejection (required)…"
                                    rows={3}
                                    required
                                    className="w-full rounded-md border border-red-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                                />
                                <Button type="submit" variant="danger" disabled={rejectForm.processing} className="w-full">
                                    Reject
                                </Button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Actions Timeline */}
                {req.actions.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">History</h2>
                        <ol className="space-y-3">
                            {req.actions.map((action) => (
                                <li key={action.id} className="flex gap-3">
                                    <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full ${action.action === 'approved' ? 'bg-green-500' : action.action === 'rejected' ? 'bg-red-500' : 'bg-slate-400'}`} />
                                    <div>
                                        <p className="text-sm text-slate-900">
                                            <span className="font-medium">{action.actor?.name ?? 'Unknown'}</span>
                                            {' '}{action.action} step {action.step_number}
                                        </p>
                                        {action.comments && <p className="text-xs text-slate-500 italic">"{action.comments}"</p>}
                                        <p className="text-xs text-slate-400">{new Date(action.acted_at).toLocaleString()}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

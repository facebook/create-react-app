import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { LeaveStatusBadge } from '@/Components/HR/LeaveStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { LeaveRequest } from '@/types/hr';

interface Props extends PageProps {
    leaveRequest: LeaveRequest;
    can?: { update?: boolean };
}

export default function LeaveRequestShow({ leaveRequest, can: permCan }: Props) {
    const { can } = usePermission();
    const canUpdate   = permCan?.update ?? can('hr.create');
    const [rejectOpen, setRejectOpen] = useState(false);

    const rejectForm = useForm({ rejection_reason: '' });

    function handleApprove() {
        if (!confirm('Approve this leave request?')) return;
        router.post(`/hr/leave-requests/${leaveRequest.id}/approve`);
    }

    function handleReject(e: React.FormEvent) {
        e.preventDefault();
        rejectForm.post(`/hr/leave-requests/${leaveRequest.id}/reject`, {
            onSuccess: () => setRejectOpen(false),
        });
    }

    function handleCancel() {
        if (!confirm('Cancel this leave request?')) return;
        router.post(`/hr/leave-requests/${leaveRequest.id}/cancel`);
    }

    return (
        <AppLayout>
            <Head title={`Leave Request #${leaveRequest.id}`} />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Leave Request #{leaveRequest.id}
                        </h1>
                        <div className="mt-1 flex items-center gap-3">
                            <LeaveStatusBadge status={leaveRequest.status} />
                            <span className="text-sm text-slate-500">
                                {leaveRequest.employee?.full_name}
                            </span>
                        </div>
                    </div>
                    {canUpdate && leaveRequest.status === 'pending' && (
                        <div className="flex gap-2">
                            <Button onClick={handleApprove}>Approve</Button>
                            <Button variant="secondary" onClick={() => setRejectOpen((o) => !o)}>Reject</Button>
                            <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                        </div>
                    )}
                    {canUpdate && leaveRequest.status === 'approved' && (
                        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                    )}
                </div>

                {rejectOpen && (
                    <form onSubmit={handleReject} className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-red-700">Rejection Reason</h3>
                        <textarea
                            value={rejectForm.data.rejection_reason}
                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            placeholder="Enter reason for rejection..."
                        />
                        {rejectForm.errors.rejection_reason && (
                            <p className="text-xs text-red-600">{rejectForm.errors.rejection_reason}</p>
                        )}
                        <div className="flex gap-2">
                            <Button type="submit" disabled={rejectForm.processing}>Confirm Reject</Button>
                            <Button type="button" variant="secondary" onClick={() => setRejectOpen(false)}>Cancel</Button>
                        </div>
                    </form>
                )}

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {[
                            { label: 'Employee',   value: leaveRequest.employee?.full_name ?? '—' },
                            { label: 'Type',       value: (leaveRequest as any).leave_type?.name ?? leaveRequest.leave_type ?? leaveRequest.type ?? '—' },
                            { label: 'Start Date', value: leaveRequest.start_date },
                            { label: 'End Date',   value: leaveRequest.end_date },
                            { label: 'Days',       value: String((leaveRequest as any).days_requested ?? leaveRequest.days ?? '—') },
                            { label: 'Reason',     value: (leaveRequest as any).reason ?? leaveRequest.notes ?? '—' },
                            { label: 'Rejection Reason', value: (leaveRequest as any).rejection_reason ?? '—' },
                            { label: 'Approved By', value: (leaveRequest.approver as any)?.name ?? leaveRequest.approver ?? '—' },
                            { label: 'Approved At', value: leaveRequest.approved_at ?? '—' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <dt className="text-xs text-slate-500">{label}</dt>
                                <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <Link href="/hr/leave-requests">
                    <Button variant="secondary">Back to Leave Requests</Button>
                </Link>
            </div>
        </AppLayout>
    );
}

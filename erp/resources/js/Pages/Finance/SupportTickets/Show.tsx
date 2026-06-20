import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { SupportTicket } from '@/types/finance';

interface User {
    id: number;
    name: string;
}

interface Props extends PageProps {
    ticket: SupportTicket;
    users?: User[];
}

const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high:   'bg-orange-100 text-orange-700',
    normal: 'bg-blue-100 text-blue-700',
    low:    'bg-gray-100 text-gray-600',
};

const statusColors: Record<string, string> = {
    open:        'bg-green-100 text-green-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved:    'bg-blue-100 text-blue-700',
    closed:      'bg-slate-100 text-slate-600',
};

export default function SupportTicketShow({ ticket, users = [] }: Props) {
    const { can } = usePermission();

    const commentForm = useForm({
        body:        '',
        is_internal: false as boolean,
    });

    const assignForm = useForm({
        assigned_to: ticket.assigned_to ? String(ticket.assigned_to) : '',
    });

    function submitComment(e: React.FormEvent) {
        e.preventDefault();
        commentForm.post(`/finance/support-tickets/${ticket.id}/comments`, {
            onSuccess: () => commentForm.reset(),
        });
    }

    function submitAssign(e: React.FormEvent) {
        e.preventDefault();
        assignForm.patch(`/finance/support-tickets/${ticket.id}/assign`);
    }

    function resolve() {
        router.post(`/finance/support-tickets/${ticket.id}/resolve`);
    }

    function close() {
        router.post(`/finance/support-tickets/${ticket.id}/close`);
    }

    function reopen() {
        router.post(`/finance/support-tickets/${ticket.id}/reopen`);
    }

    const inputClass = 'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <AppLayout>
            <Head title={`Ticket ${ticket.reference}`} />
            <div className="space-y-6 p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-sm text-slate-500">{ticket.reference}</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[ticket.priority] ?? ''}`}>
                                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[ticket.status] ?? ''}`}>
                                {ticket.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-800">{ticket.subject}</h1>
                    </div>
                    <Link href="/finance/support-tickets">
                        <Button variant="secondary">Back</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="col-span-2 space-y-6">
                        {/* Description */}
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">Description</h2>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
                        </div>

                        {/* Comments */}
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Comments</h2>

                            {(ticket.comments ?? []).length === 0 && (
                                <p className="text-sm text-slate-500">No comments yet.</p>
                            )}

                            {(ticket.comments ?? []).map((comment) => (
                                <div
                                    key={comment.id}
                                    className={`rounded-lg p-4 text-sm ${comment.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-slate-50 border border-slate-200'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-slate-800">
                                            {comment.created_by_user?.name ?? 'Unknown'}
                                        </span>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            {comment.is_internal && (
                                                <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-yellow-700 font-medium">Internal</span>
                                            )}
                                            <span>{new Date(comment.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-700 whitespace-pre-wrap">{comment.body}</p>
                                </div>
                            ))}

                            {/* Add Comment form */}
                            {can('finance.view') && (
                                <form onSubmit={submitComment} className="space-y-3 pt-2 border-t border-slate-200">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Add Comment</label>
                                        <textarea
                                            value={commentForm.data.body}
                                            onChange={(e) => commentForm.setData('body', e.target.value)}
                                            rows={3}
                                            className={inputClass}
                                        />
                                        {commentForm.errors.body && (
                                            <p className="mt-1 text-xs text-red-600">{commentForm.errors.body}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={commentForm.data.is_internal}
                                                onChange={(e) => commentForm.setData('is_internal', e.target.checked)}
                                                className="rounded border-slate-300"
                                            />
                                            Internal note
                                        </label>
                                        <Button type="submit" disabled={commentForm.processing}>
                                            Add Comment
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Details */}
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm text-sm space-y-3">
                            <h2 className="font-semibold text-slate-700 uppercase tracking-wide text-xs">Details</h2>
                            <div>
                                <dt className="text-xs text-slate-500">Category</dt>
                                <dd className="text-slate-800">{ticket.category ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">Contact</dt>
                                <dd className="text-slate-800">{(ticket as any).contact?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">Assigned To</dt>
                                <dd className="text-slate-800">{ticket.assigned_to_user?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">Created By</dt>
                                <dd className="text-slate-800">{ticket.created_by_user?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">Created At</dt>
                                <dd className="text-slate-800">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '—'}</dd>
                            </div>
                            {ticket.resolved_at && (
                                <div>
                                    <dt className="text-xs text-slate-500">Resolved At</dt>
                                    <dd className="text-slate-800">{new Date(ticket.resolved_at).toLocaleString()}</dd>
                                </div>
                            )}
                            {ticket.response_time_hours !== null && (
                                <div>
                                    <dt className="text-xs text-slate-500">Response Time</dt>
                                    <dd className="text-slate-800">{ticket.response_time_hours}h</dd>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {can('finance.create') && (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                                <h2 className="font-semibold text-slate-700 uppercase tracking-wide text-xs mb-3">Actions</h2>
                                {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                                    <button
                                        onClick={resolve}
                                        className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                                    >
                                        Resolve
                                    </button>
                                )}
                                {ticket.status === 'resolved' && (
                                    <button
                                        onClick={close}
                                        className="w-full rounded-md bg-slate-600 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                                    >
                                        Close
                                    </button>
                                )}
                                {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                                    <button
                                        onClick={reopen}
                                        className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        Reopen
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Assign */}
                        {can('finance.create') && users.length > 0 && (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <h2 className="font-semibold text-slate-700 uppercase tracking-wide text-xs mb-3">Assign To</h2>
                                <form onSubmit={submitAssign} className="space-y-2">
                                    <select
                                        value={assignForm.data.assigned_to}
                                        onChange={(e) => assignForm.setData('assigned_to', e.target.value)}
                                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">— Unassigned —</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                    <Button type="submit" disabled={assignForm.processing}>Assign</Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

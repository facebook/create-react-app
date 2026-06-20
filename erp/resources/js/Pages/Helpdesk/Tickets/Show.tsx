import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Team { id: number; name: string }
interface User { id: number; name: string }

interface Message {
    id: number;
    body: string;
    is_internal: boolean;
    created_at: string;
    author: User | null;
}

interface Ticket {
    id: number;
    ticket_number: string | null;
    subject: string;
    description: string | null;
    type: string;
    priority: string;
    status: string;
    customer_name: string | null;
    customer_email: string | null;
    sla_deadline: string | null;
    first_response_at: string | null;
    resolved_at: string | null;
    closed_at: string | null;
    created_at: string;
    is_overdue: boolean;
    team: Team | null;
    assignee: User | null;
    messages: Message[];
}

interface Props extends PageProps {
    ticket: Ticket;
    teams: Team[];
    users: User[];
}

const priorityBadge: Record<string, string> = {
    low:    'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

const statusBadge: Record<string, string> = {
    open:        'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    pending:     'bg-yellow-100 text-yellow-700',
    resolved:    'bg-green-100 text-green-700',
    closed:      'bg-slate-100 text-slate-700',
};

export default function TicketShow({ ticket, teams, users }: Props) {
    const replyForm = useForm({ body: '', is_internal: false });

    function submitReply(e: React.FormEvent) {
        e.preventDefault();
        replyForm.post(`/helpdesk/tickets/${ticket.id}/reply`, {
            onSuccess: () => replyForm.reset(),
        });
    }

    function action(url: string) {
        router.post(url);
    }

    return (
        <AppLayout>
            <Head title={`Ticket ${ticket.ticket_number ?? ticket.id}`} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href="/helpdesk/tickets" className="text-sm text-slate-500 hover:text-slate-700">← Tickets</Link>
                            <span className="font-mono text-sm text-slate-400">{ticket.ticket_number ?? `#${ticket.id}`}</span>
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">{ticket.subject}</h1>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${priorityBadge[ticket.priority] ?? priorityBadge.medium}`}>
                                {ticket.priority}
                            </span>
                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusBadge[ticket.status] ?? statusBadge.open}`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                            {ticket.sla_deadline && (
                                <span className={`text-xs ${ticket.is_overdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                                    SLA: {ticket.sla_deadline}{ticket.is_overdue ? ' (overdue)' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                        <Link href={`/helpdesk/tickets/${ticket.id}/edit`}>
                            <Button variant="secondary">Edit</Button>
                        </Link>
                        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                            <Button onClick={() => action(`/helpdesk/tickets/${ticket.id}/resolve`)} variant="secondary">
                                Resolve
                            </Button>
                        )}
                        {ticket.status !== 'closed' && (
                            <Button onClick={() => action(`/helpdesk/tickets/${ticket.id}/close`)} variant="secondary">
                                Close
                            </Button>
                        )}
                        {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                            <Button onClick={() => action(`/helpdesk/tickets/${ticket.id}/reopen`)} variant="secondary">
                                Reopen
                            </Button>
                        )}
                        <form method="POST" action={`/helpdesk/tickets/${ticket.id}`} onSubmit={(e) => {
                            e.preventDefault();
                            if (confirm('Delete this ticket?')) router.delete(`/helpdesk/tickets/${ticket.id}`);
                        }}>
                            <Button type="submit" variant="secondary">Delete</Button>
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {ticket.description && (
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-sm font-semibold text-slate-700 mb-3">Description</h2>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h2 className="text-base font-semibold text-slate-800">Messages ({ticket.messages.length})</h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {ticket.messages.length === 0 && (
                                    <p className="px-6 py-8 text-center text-sm text-slate-400">No messages yet.</p>
                                )}
                                {ticket.messages.map(msg => (
                                    <div key={msg.id} className={`p-6 ${msg.is_internal ? 'bg-yellow-50' : ''}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-slate-800">
                                                {msg.author?.name ?? 'Unknown'}
                                                {msg.is_internal && (
                                                    <span className="ml-2 inline-block rounded bg-yellow-200 px-1.5 py-0.5 text-xs text-yellow-800">Internal Note</span>
                                                )}
                                            </span>
                                            <span className="text-xs text-slate-400">{msg.created_at}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.body}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Form */}
                            <div className="border-t border-slate-200 p-6">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Reply</h3>
                                <form onSubmit={submitReply} className="space-y-3">
                                    <textarea
                                        value={replyForm.data.body}
                                        onChange={e => replyForm.setData('body', e.target.value)}
                                        rows={4}
                                        placeholder="Write your reply..."
                                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {replyForm.errors.body && <p className="text-xs text-red-500">{replyForm.errors.body}</p>}
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-sm text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={replyForm.data.is_internal}
                                                onChange={e => replyForm.setData('is_internal', e.target.checked)}
                                                className="rounded border-slate-300"
                                            />
                                            Internal note (not visible to customer)
                                        </label>
                                        <Button type="submit" disabled={replyForm.processing}>
                                            {replyForm.processing ? 'Sending...' : 'Send Reply'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                            <h2 className="text-sm font-semibold text-slate-700">Details</h2>

                            <div>
                                <dt className="text-xs text-slate-500">Type</dt>
                                <dd className="text-sm text-slate-800 capitalize">{ticket.type.replace('_', ' ')}</dd>
                            </div>

                            <div>
                                <dt className="text-xs text-slate-500">Team</dt>
                                <dd className="text-sm text-slate-800">{ticket.team?.name ?? '—'}</dd>
                            </div>

                            <div>
                                <dt className="text-xs text-slate-500">Assignee</dt>
                                <dd className="text-sm text-slate-800">{ticket.assignee?.name ?? 'Unassigned'}</dd>
                            </div>

                            <div>
                                <dt className="text-xs text-slate-500">Customer</dt>
                                <dd className="text-sm text-slate-800">{ticket.customer_name ?? '—'}</dd>
                                {ticket.customer_email && <dd className="text-xs text-slate-500">{ticket.customer_email}</dd>}
                            </div>

                            <div>
                                <dt className="text-xs text-slate-500">First Response</dt>
                                <dd className="text-sm text-slate-800">{ticket.first_response_at ?? '—'}</dd>
                            </div>

                            {ticket.resolved_at && (
                                <div>
                                    <dt className="text-xs text-slate-500">Resolved At</dt>
                                    <dd className="text-sm text-slate-800">{ticket.resolved_at}</dd>
                                </div>
                            )}

                            {ticket.closed_at && (
                                <div>
                                    <dt className="text-xs text-slate-500">Closed At</dt>
                                    <dd className="text-sm text-slate-800">{ticket.closed_at}</dd>
                                </div>
                            )}

                            <div>
                                <dt className="text-xs text-slate-500">Created</dt>
                                <dd className="text-sm text-slate-800">{ticket.created_at}</dd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

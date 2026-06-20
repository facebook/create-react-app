import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Team { id: number; name: string }
interface User { id: number; name: string }

interface Ticket {
    id: number;
    ticket_number: string | null;
    subject: string;
    description: string | null;
    type: string;
    priority: string;
    status: string;
    team_id: number | null;
    assigned_to: number | null;
    customer_name: string | null;
    customer_email: string | null;
}

interface Props extends PageProps {
    ticket: Ticket;
    teams: Team[];
    users: User[];
}

export default function TicketEdit({ ticket, teams, users }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        subject:        ticket.subject,
        description:    ticket.description ?? '',
        type:           ticket.type,
        priority:       ticket.priority,
        status:         ticket.status,
        team_id:        ticket.team_id ? String(ticket.team_id) : '',
        assigned_to:    ticket.assigned_to ? String(ticket.assigned_to) : '',
        customer_name:  ticket.customer_name ?? '',
        customer_email: ticket.customer_email ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/helpdesk/tickets/${ticket.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Edit Ticket ${ticket.ticket_number ?? ticket.id}`} />
            <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/helpdesk/tickets/${ticket.id}`} className="text-sm text-slate-500 hover:text-slate-700">← Back</Link>
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Ticket {ticket.ticket_number ?? `#${ticket.id}`}</h1>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Subject *</label>
                        <input
                            type="text"
                            value={data.subject}
                            onChange={e => setData('subject', e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Type</label>
                            <select value={data.type} onChange={e => setData('type', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="issue">Issue</option>
                                <option value="question">Question</option>
                                <option value="feature_request">Feature Request</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Priority</label>
                            <select value={data.priority} onChange={e => setData('priority', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Status</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Customer Name</label>
                            <input
                                type="text"
                                value={data.customer_name}
                                onChange={e => setData('customer_name', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Customer Email</label>
                            <input
                                type="email"
                                value={data.customer_email}
                                onChange={e => setData('customer_email', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Team</label>
                            <select value={data.team_id} onChange={e => setData('team_id', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="">— No team —</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Assign To</label>
                            <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="">— Unassigned —</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href={`/helpdesk/tickets/${ticket.id}`}>
                            <Button variant="secondary" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

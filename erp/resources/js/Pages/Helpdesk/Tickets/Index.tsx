import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Team { id: number; name: string }
interface User { id: number; name: string }

interface Ticket {
    id: number;
    ticket_number: string | null;
    subject: string;
    customer_name: string | null;
    priority: string;
    status: string;
    sla_deadline: string | null;
    is_overdue: boolean;
    created_at: string;
    team: Team | null;
    assignee: User | null;
}

interface Paginated {
    data: Ticket[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    tickets: Paginated;
    filters: { status?: string; priority?: string; team_id?: string; assigned_to?: string; search?: string };
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

export default function TicketsIndex({ tickets, filters }: Props) {
    function search(key: string, value: string) {
        router.get('/helpdesk/tickets', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Helpdesk Tickets" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Support Tickets</h1>
                        <p className="text-sm text-slate-500 mt-1">{tickets.total} records</p>
                    </div>
                    <Link href="/helpdesk/tickets/create"><Button>New Ticket</Button></Link>
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap gap-3">
                    <input
                        type="text"
                        placeholder="Search subject or customer..."
                        defaultValue={filters.search}
                        onChange={e => search('search', e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
                    />
                    <select value={filters.status ?? ''} onChange={e => search('status', e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select value={filters.priority ?? ''} onChange={e => search('priority', e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Subject</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Team</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Assignee</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">SLA Deadline</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {tickets.data.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">No tickets found.</td>
                                </tr>
                            )}
                            {tickets.data.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm">
                                        <Link href={`/helpdesk/tickets/${ticket.id}`} className="font-mono text-xs text-indigo-600 hover:text-indigo-800">
                                            {ticket.ticket_number ?? `#${ticket.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900 max-w-[200px] truncate">
                                        <Link href={`/helpdesk/tickets/${ticket.id}`} className="hover:text-indigo-600">{ticket.subject}</Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{ticket.customer_name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{ticket.team?.name ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${priorityBadge[ticket.priority] ?? priorityBadge.medium}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusBadge[ticket.status] ?? statusBadge.open}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{ticket.assignee?.name ?? '—'}</td>
                                    <td className={`px-4 py-3 text-sm ${ticket.is_overdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                                        {ticket.sla_deadline ?? '—'}
                                        {ticket.is_overdue && <span className="ml-1 text-xs">(overdue)</span>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{ticket.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {tickets.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Page {tickets.current_page} of {tickets.last_page}</p>
                        <div className="flex gap-2">
                            {tickets.current_page > 1 && (
                                <Link href={`/helpdesk/tickets?page=${tickets.current_page - 1}`} className="rounded border px-3 py-1 text-sm hover:bg-slate-50">Prev</Link>
                            )}
                            {tickets.current_page < tickets.last_page && (
                                <Link href={`/helpdesk/tickets?page=${tickets.current_page + 1}`} className="rounded border px-3 py-1 text-sm hover:bg-slate-50">Next</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

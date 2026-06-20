import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { SupportTicket } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    tickets: Paginator<SupportTicket>;
    filters: { status?: string; priority?: string };
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

const STATUSES   = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export default function SupportTicketsIndex({ tickets, filters }: Props) {
    const { can } = usePermission();

    function applyFilter(key: string, value: string) {
        router.get('/finance/support-tickets', { ...filters, [key]: value || undefined }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Support Tickets" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">Support Tickets</h1>
                    {can('finance.create') && (
                        <Link href="/finance/support-tickets/create">
                            <Button>New Ticket</Button>
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                        ))}
                    </select>

                    <select
                        value={filters.priority ?? ''}
                        onChange={(e) => applyFilter('priority', e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Priorities</option>
                        {PRIORITIES.map((p) => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table>
                        <Table.Head>
                            <Table.Row>
                                <Table.Th>Reference</Table.Th>
                                <Table.Th>Subject</Table.Th>
                                <Table.Th>Priority</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Assigned To</Table.Th>
                                <Table.Th>Created</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {tickets.data.map((ticket) => (
                                <Table.Row key={ticket.id}>
                                    <Table.Td className="font-mono text-sm font-medium">{ticket.reference}</Table.Td>
                                    <Table.Td>{ticket.subject}</Table.Td>
                                    <Table.Td>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[ticket.priority] ?? ''}`}>
                                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                        </span>
                                    </Table.Td>
                                    <Table.Td>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[ticket.status] ?? ''}`}>
                                            {ticket.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </span>
                                    </Table.Td>
                                    <Table.Td>{ticket.assigned_to_user?.name ?? '—'}</Table.Td>
                                    <Table.Td className="text-slate-500 text-sm">
                                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '—'}
                                    </Table.Td>
                                    <Table.Td>
                                        <Link
                                            href={`/finance/support-tickets/${ticket.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            View
                                        </Link>
                                    </Table.Td>
                                </Table.Row>
                            ))}
                            {tickets.data.length === 0 && (
                                <Table.Row>
                                    <Table.Td colSpan={7} className="py-8 text-center text-slate-500">
                                        No tickets found.
                                    </Table.Td>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                </div>

                <Pagination links={tickets.links} />
            </div>
        </AppLayout>
    );
}

import React from 'react';
import { router } from '@inertiajs/react';

interface Escalation {
    id: number;
    escalation_type: string;
    escalated_at: string;
    resolved_at: string | null;
    notes: string | null;
    ticket: { id: number; ticket_number: string; subject: string; priority: string };
    escalated_to: { name: string } | null;
}

interface Paginated<T> { data: T[]; current_page: number; last_page: number; }

const TYPE_LABELS: Record<string, string> = {
    response_breach: 'Response Breach',
    resolution_breach: 'Resolution Breach',
};

export default function Escalations({
    escalations,
    show_resolved,
}: {
    escalations: Paginated<Escalation>;
    show_resolved: boolean;
}) {
    const checkBreaches = () => {
        router.post('/helpdesk/sla/check-breaches');
    };

    const resolveEscalation = (id: number) => {
        router.post(`/helpdesk/escalations/${id}/resolve`);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">SLA Escalations</h1>
                    <p className="text-sm text-gray-500 mt-1">Tickets that have breached their SLA deadline.</p>
                </div>
                <div className="flex gap-3">
                    <a href="/helpdesk/sla/policies" className="text-blue-600 hover:underline text-sm self-center">Policies</a>
                    <button
                        onClick={() => router.get('/helpdesk/sla/escalations', { show_resolved: show_resolved ? '0' : '1' })}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
                    >
                        {show_resolved ? 'Hide Resolved' : 'Show Resolved'}
                    </button>
                    <button onClick={checkBreaches} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
                        Check Breaches Now
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Ticket</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Subject</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Type</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Escalated At</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Escalated To</th>
                            <th className="px-4 py-3 text-center text-gray-600 font-medium">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {escalations.data.map(e => (
                            <tr key={e.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <a href={`/helpdesk/tickets/${e.ticket.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                                        {e.ticket.ticket_number}
                                    </a>
                                </td>
                                <td className="px-4 py-3 text-gray-700">{e.ticket.subject}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                                        {TYPE_LABELS[e.escalation_type] ?? e.escalation_type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{new Date(e.escalated_at).toLocaleString()}</td>
                                <td className="px-4 py-3 text-gray-600">{e.escalated_to?.name ?? '—'}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${e.resolved_at ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        {e.resolved_at ? 'Resolved' : 'Open'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {!e.resolved_at && (
                                        <button onClick={() => resolveEscalation(e.id)} className="text-green-600 hover:underline text-xs">
                                            Resolve
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {escalations.data.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No escalations found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useRef } from 'react';

interface LeadCard {
    id: number;
    title: string;
    contact_name: string | null;
    expected_revenue: number | null;
    probability: number | null;
    priority: string;
    assignee: { name: string } | null;
}

interface Column {
    id: number;
    name: string;
    color: string;
    leads: LeadCard[];
}

interface Props {
    columns: Column[];
}

const PRIORITY_COLORS: Record<string, string> = {
    low:    'bg-slate-100 text-slate-500',
    normal: 'bg-blue-100 text-blue-600',
    high:   'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
};

export default function PipelineKanban({ columns: initialColumns }: Props) {
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const dragLead = useRef<{ lead: LeadCard; fromColId: number } | null>(null);

    function onDragStart(lead: LeadCard, fromColId: number) {
        dragLead.current = { lead, fromColId };
    }

    function onDrop(toColId: number) {
        if (!dragLead.current || dragLead.current.fromColId === toColId) return;
        const { lead, fromColId } = dragLead.current;
        dragLead.current = null;

        setColumns(prev => prev.map(col => {
            if (col.id === fromColId) return { ...col, leads: col.leads.filter(l => l.id !== lead.id) };
            if (col.id === toColId)   return { ...col, leads: [...col.leads, lead] };
            return col;
        }));

        router.patch(`/crm/leads/${lead.id}/move-stage`, { stage_id: toColId });
    }

    return (
        <AppLayout>
            <Head title="CRM Pipeline — Kanban" />
            <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-slate-800">Pipeline Kanban</h1>
                    <div className="ml-auto flex gap-2">
                        <Link href="/crm/leads?type=opportunity" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                            List
                        </Link>
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map(col => (
                        <div
                            key={col.id}
                            className="flex w-72 shrink-0 flex-col rounded-lg border border-slate-200 bg-slate-50 p-3"
                            onDragOver={e => e.preventDefault()}
                            onDrop={() => onDrop(col.id)}
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: col.color }} />
                                <span className="text-sm font-semibold text-slate-700">{col.name}</span>
                                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600 shadow-sm">
                                    {col.leads.length}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {col.leads.map(lead => (
                                    <div
                                        key={lead.id}
                                        draggable
                                        onDragStart={() => onDragStart(lead, col.id)}
                                        className="cursor-grab rounded-md border border-white bg-white p-3 shadow-sm hover:shadow-md transition-shadow active:cursor-grabbing"
                                    >
                                        <Link href={`/crm/leads/${lead.id}`} className="block text-sm font-medium text-slate-800 hover:text-blue-600">
                                            {lead.title}
                                        </Link>
                                        {lead.contact_name && (
                                            <p className="mt-0.5 text-xs text-slate-500">{lead.contact_name}</p>
                                        )}
                                        <div className="mt-2 flex items-center justify-between">
                                            {lead.expected_revenue != null && (
                                                <span className="text-sm font-semibold text-slate-700">
                                                    ${Number(lead.expected_revenue).toLocaleString()}
                                                </span>
                                            )}
                                            {lead.probability != null && (
                                                <span className="text-xs text-slate-400">{lead.probability}%</span>
                                            )}
                                        </div>
                                        <div className="mt-1.5 flex items-center gap-1">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[lead.priority] ?? 'bg-slate-100 text-slate-500'}`}>
                                                {lead.priority}
                                            </span>
                                            {lead.assignee && (
                                                <span className="ml-auto text-xs text-slate-400">{lead.assignee.name}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href={`/crm/leads/create`}
                                className="mt-3 block rounded-md border border-dashed border-slate-300 py-1.5 text-center text-xs text-slate-400 hover:border-slate-400 hover:text-slate-600"
                            >
                                + Add lead
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

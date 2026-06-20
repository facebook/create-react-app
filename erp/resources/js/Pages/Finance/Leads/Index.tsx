import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Lead } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    leads: Paginator<Lead>;
    filters: { stage?: string };
}

const stageColors: Record<string, string> = {
    new:          'bg-slate-100 text-slate-700',
    contacted:    'bg-blue-100 text-blue-700',
    qualified:    'bg-indigo-100 text-indigo-700',
    proposal:     'bg-purple-100 text-purple-700',
    negotiation:  'bg-yellow-100 text-yellow-700',
    won:          'bg-green-100 text-green-700',
    lost:         'bg-red-100 text-red-700',
};

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

export default function LeadsIndex({ leads, filters }: Props) {
    const { can } = usePermission();

    function filterByStage(stage: string) {
        router.get('/finance/leads', { stage: stage || undefined }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="CRM / Leads" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">CRM / Leads</h1>
                    {can('finance.create') && (
                        <Link href="/finance/leads/create">
                            <Button>New Lead</Button>
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={filters.stage ?? ''}
                        onChange={(e) => filterByStage(e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Stages</option>
                        {STAGES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table>
                        <Table.Head>
                            <Table.Row>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Company</Table.Th>
                                <Table.Th>Source</Table.Th>
                                <Table.Th>Stage</Table.Th>
                                <Table.Th>Value</Table.Th>
                                <Table.Th>Weighted Value</Table.Th>
                                <Table.Th>Probability %</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {leads.data.map((lead) => (
                                <Table.Row key={lead.id}>
                                    <Table.Td className="font-medium">{lead.name}</Table.Td>
                                    <Table.Td>{lead.company ?? '—'}</Table.Td>
                                    <Table.Td className="capitalize">{lead.source.replace(/_/g, ' ')}</Table.Td>
                                    <Table.Td>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stageColors[lead.stage] ?? ''}`}>
                                            {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
                                        </span>
                                    </Table.Td>
                                    <Table.Td>
                                        {lead.estimated_value != null
                                            ? Number(lead.estimated_value).toLocaleString(undefined, { minimumFractionDigits: 2 })
                                            : '—'}
                                    </Table.Td>
                                    <Table.Td>
                                        {Number(lead.weighted_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </Table.Td>
                                    <Table.Td>{lead.probability}%</Table.Td>
                                    <Table.Td>
                                        <Link
                                            href={`/finance/leads/${lead.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            View
                                        </Link>
                                    </Table.Td>
                                </Table.Row>
                            ))}
                            {leads.data.length === 0 && (
                                <Table.Row>
                                    <Table.Td colSpan={8} className="py-8 text-center text-slate-500">
                                        No leads found.
                                    </Table.Td>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                </div>

                <Pagination links={leads.links} />
            </div>
        </AppLayout>
    );
}

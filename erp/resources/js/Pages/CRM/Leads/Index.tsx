import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Stage { id: number; name: string }

interface Lead {
    id: number;
    reference: string | null;
    title: string;
    type: string;
    status: string;
    priority: string;
    expected_revenue: number;
    expected_close_date: string | null;
    company_name: string | null;
    stage: Stage | null;
}

interface Paginated {
    data: Lead[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    leads: Paginated;
    filters: { type?: string; status?: string; search?: string };
}

const priorityBadge: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600', normal: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700',
};
const statusBadge: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700', won: 'bg-green-100 text-green-700', lost: 'bg-red-100 text-red-700',
};

function fmt(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function LeadsIndex({ leads, filters }: Props) {
    function search(key: string, value: string) {
        router.get('/crm/leads', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Leads & Opportunities" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Leads &amp; Opportunities</h1>
                        <p className="text-sm text-slate-500 mt-1">{leads.total} records</p>
                    </div>
                    <Link href="/crm/leads/create"><Button>New Lead</Button></Link>
                </div>

                <div className="flex flex-wrap gap-3">
                    <input type="text" placeholder="Search title or contact..." defaultValue={filters.search}
                        onChange={e => search('search', e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64" />
                    <select value={filters.type ?? ''} onChange={e => search('type', e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <option value="">All Types</option>
                        <option value="lead">Lead</option>
                        <option value="opportunity">Opportunity</option>
                    </select>
                    <select value={filters.status ?? ''} onChange={e => search('status', e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Reference</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Stage</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Revenue</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Close Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {leads.data.length === 0 && (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">No leads found.</td></tr>
                            )}
                            {leads.data.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm">
                                        <Link href={`/crm/leads/${lead.id}`} className="font-mono text-xs text-indigo-600 hover:text-indigo-800">
                                            {lead.reference ?? `#${lead.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900 max-w-[200px] truncate">
                                        <Link href={`/crm/leads/${lead.id}`} className="hover:text-indigo-600">{lead.title}</Link>
                                        {lead.company_name && <div className="text-xs text-slate-500 font-normal">{lead.company_name}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{lead.type}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{lead.stage?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{fmt(lead.expected_revenue)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${priorityBadge[lead.priority] ?? priorityBadge.normal}`}>
                                            {lead.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusBadge[lead.status] ?? statusBadge.open}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{lead.expected_close_date ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {leads.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Page {leads.current_page} of {leads.last_page}</p>
                        <div className="flex gap-2">
                            {leads.current_page > 1 && (
                                <Link href={`/crm/leads?page=${leads.current_page - 1}`} className="rounded border px-3 py-1 text-sm hover:bg-slate-50">Prev</Link>
                            )}
                            {leads.current_page < leads.last_page && (
                                <Link href={`/crm/leads?page=${leads.current_page + 1}`} className="rounded border px-3 py-1 text-sm hover:bg-slate-50">Next</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

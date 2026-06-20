import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { RecurringStatusBadge } from '@/Components/Finance/RecurringStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { RecurringInvoice, RecurringStatus, Contact } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    recurringInvoices: Paginator<RecurringInvoice>;
    contacts: Pick<Contact, 'id' | 'name'>[];
    filters: { status?: RecurringStatus; contact_id?: number };
}

const STATUS_TABS: Array<{ value: RecurringStatus | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'ended', label: 'Ended' },
];

export default function RecurringInvoicesIndex({ recurringInvoices, contacts, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/finance/recurring-invoices', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Recurring Invoices" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Recurring Invoices</h1>
                        <p className="text-sm text-slate-500 mt-1">{recurringInvoices.total} templates</p>
                    </div>
                    <div className="flex gap-2">
                        {can('finance.create') && (
                            <Link href="/finance/recurring-invoices/create"><Button>New Recurring Invoice</Button></Link>
                        )}
                    </div>
                </div>

                {/* Status tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    {STATUS_TABS.map((tab) => (
                        <button key={tab.value}
                            onClick={() => setStatus(tab.value)}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                (filters.status ?? '') === tab.value
                                    ? 'border-indigo-600 text-indigo-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            ].join(' ')}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                        <select value={filters.contact_id ?? ''}
                            onChange={(e) => router.get('/finance/recurring-invoices', { ...filters, contact_id: e.target.value || undefined }, { preserveState: true, replace: true })}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">All Contacts</option>
                            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'contact', header: 'Contact', render: (ri) => (
                                <Link href={`/finance/recurring-invoices/${ri.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                    {ri.contact?.name ?? '—'}
                                </Link>
                            )},
                            { key: 'frequency', header: 'Frequency', render: (ri) => ri.frequency.charAt(0).toUpperCase() + ri.frequency.slice(1) },
                            { key: 'next_run_date', header: 'Next Run', render: (ri) => ri.next_run_date },
                            { key: 'total', header: 'Total', render: (ri) => ri.total !== undefined ? Number(ri.total).toFixed(2) : '—' },
                            { key: 'generated_count', header: 'Generated #', render: (ri) => ri.generated_count },
                            { key: 'status', header: 'Status', render: (ri) => <RecurringStatusBadge status={ri.status} /> },
                            { key: 'actions', header: '', render: (ri) => (
                                <Link href={`/finance/recurring-invoices/${ri.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View</Link>
                            )},
                        ]}
                        data={recurringInvoices.data}
                        emptyMessage="No recurring invoices found."
                    />
                    <Pagination paginator={recurringInvoices} />
                </div>
            </div>
        </AppLayout>
    );
}

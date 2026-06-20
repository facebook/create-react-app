import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { InvoiceStatusBadge } from '@/Components/Finance/InvoiceStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Contact, Invoice, InvoiceStatus } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    invoices: Paginator<Invoice>;
    contacts: Pick<Contact, 'id' | 'name'>[];
    filters: { status?: InvoiceStatus; contact_id?: number; search?: string };
}

const STATUS_TABS: Array<{ value: InvoiceStatus | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function InvoicesIndex({ invoices, contacts, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/finance/invoices', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const search = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
        router.get('/finance/invoices', { ...filters, search }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Invoices" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
                        <p className="text-sm text-slate-500 mt-1">{invoices.total} invoices</p>
                    </div>
                    <div className="flex gap-2">
                        {can('finance.view') && (
                            <Button variant="secondary" onClick={() => { window.location.href = '/export/invoices'; }}>Export CSV</Button>
                        )}
                        {can('finance.create') && (
                            <Link href="/finance/invoices/create"><Button>New Invoice</Button></Link>
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
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <input name="search" type="text" defaultValue={filters.search ?? ''}
                                placeholder="Search by invoice number…"
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <Button type="submit" variant="secondary" size="sm">Search</Button>
                        </form>
                        <select value={filters.contact_id ?? ''}
                            onChange={(e) => router.get('/finance/invoices', { ...filters, contact_id: e.target.value || undefined }, { preserveState: true, replace: true })}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">All Contacts</option>
                            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'number', header: 'Invoice #', render: (inv) => (
                                <Link href={`/finance/invoices/${inv.id}`} className="font-mono text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                    {inv.number ?? `#${inv.id}`}
                                </Link>
                            )},
                            { key: 'contact', header: 'Contact', render: (inv) => inv.contact?.name ?? '—' },
                            { key: 'issue_date', header: 'Issue Date', render: (inv) => inv.issue_date },
                            { key: 'due_date', header: 'Due', render: (inv) => (
                                <span className={inv.is_overdue ? 'text-red-600 font-medium' : ''}>
                                    {inv.due_date ?? '—'}
                                </span>
                            )},
                            { key: 'status', header: 'Status', render: (inv) => <InvoiceStatusBadge status={inv.status} /> },
                            { key: 'actions', header: '', render: (inv) => (
                                <Link href={`/finance/invoices/${inv.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View</Link>
                            )},
                        ]}
                        data={invoices.data}
                        emptyMessage="No invoices found."
                    />
                    <Pagination paginator={invoices} />
                </div>
            </div>
        </AppLayout>
    );
}

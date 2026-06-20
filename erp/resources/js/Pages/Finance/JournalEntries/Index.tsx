import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { JournalEntryStatusBadge } from '@/Components/Finance/JournalEntryStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { JournalEntry } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    entries: Paginator<JournalEntry>;
    filters: { status?: string; search?: string };
}

export default function JournalEntriesIndex({ entries, filters }: Props) {
    const { can } = usePermission();

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const search = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
        router.get('/finance/journal-entries', { ...filters, search }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Journal Entries" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Journal Entries</h1>
                        <p className="text-sm text-slate-500 mt-1">{entries.total} entries</p>
                    </div>
                    {can('finance.create') && (
                        <Link href="/finance/journal-entries/create"><Button>New Entry</Button></Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <input name="search" type="text" defaultValue={filters.search ?? ''}
                                placeholder="Search description or reference…"
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <Button type="submit" variant="secondary" size="sm">Search</Button>
                        </form>
                        <select value={filters.status ?? ''}
                            onChange={(e) => router.get('/finance/journal-entries', { ...filters, status: e.target.value || undefined }, { preserveState: true, replace: true })}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="posted">Posted</option>
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'date', header: 'Date', render: (e) => <span className="text-sm text-slate-700">{e.date}</span> },
                            { key: 'reference', header: 'Reference', render: (e) => e.reference ?? '—' },
                            { key: 'description', header: 'Description', render: (e) => (
                                <span className="font-medium text-slate-900">{e.description}</span>
                            )},
                            { key: 'total', header: 'Debits / Credits', render: (e) => (
                                <span className="text-sm text-slate-600">
                                    {e.total_debits !== undefined
                                        ? `${Number(e.total_debits).toFixed(2)} / ${Number(e.total_credits).toFixed(2)}`
                                        : '—'}
                                </span>
                            )},
                            { key: 'status', header: 'Status', render: (e) => <JournalEntryStatusBadge status={e.status} /> },
                            { key: 'actions', header: '', render: (e) => (
                                <Link href={`/finance/journal-entries/${e.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View</Link>
                            )},
                        ]}
                        data={entries.data}
                        emptyMessage="No journal entries found."
                    />
                    <Pagination paginator={entries} />
                </div>
            </div>
        </AppLayout>
    );
}

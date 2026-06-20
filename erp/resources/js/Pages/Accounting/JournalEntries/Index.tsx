import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface JournalEntry {
    id: number;
    entry_number: string | null;
    description: string | null;
    entry_date: string;
    status: 'draft' | 'posted' | 'reversed';
    lines_count: number;
}

interface PaginatedEntries {
    data: JournalEntry[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    entries: PaginatedEntries;
    filters: { status?: string };
}

const STATUS_BADGE: Record<string, string> = {
    draft:    'bg-slate-100 text-slate-600',
    posted:   'bg-green-100 text-green-700',
    reversed: 'bg-orange-100 text-orange-700',
};

export default function JournalEntriesIndex({ entries, filters }: Props) {
    const [status, setStatus] = useState(filters.status ?? '');
    const { flash } = usePage<PageProps>().props as any;

    function applyFilter() {
        router.get('/accounting/journal-entries', { status: status || undefined }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Journal Entries" />
            <div className="mx-auto max-w-6xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Journal Entries</h1>
                    <Button href="/accounting/journal-entries/create">New Journal Entry</Button>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="posted">Posted</option>
                        <option value="reversed">Reversed</option>
                    </select>
                    <Button variant="secondary" onClick={applyFilter} size="sm">Filter</Button>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Entry #</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Lines</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {entries.data.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-slate-700">
                                        {entry.entry_number ?? `#${entry.id}`}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{entry.description ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-600">{entry.entry_date}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[entry.status] ?? ''}`}>
                                            {entry.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600">{entry.lines_count}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            href={`/accounting/journal-entries/${entry.id}`}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {entries.data.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No journal entries found.</div>
                    )}
                </div>

                {entries.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Page {entries.current_page} of {entries.last_page} ({entries.total} total)</span>
                        <div className="flex gap-2">
                            {entries.current_page > 1 && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => router.get('/accounting/journal-entries', { page: entries.current_page - 1 })}
                                >
                                    Previous
                                </Button>
                            )}
                            {entries.current_page < entries.last_page && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => router.get('/accounting/journal-entries', { page: entries.current_page + 1 })}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

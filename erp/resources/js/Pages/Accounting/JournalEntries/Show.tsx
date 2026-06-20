import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Line {
    id: number;
    description: string | null;
    debit: number;
    credit: number;
    account: { id: number; code: string; name: string } | null;
}

interface JournalEntry {
    id: number;
    entry_number: string | null;
    reference: string | null;
    description: string | null;
    entry_date: string;
    status: 'draft' | 'posted' | 'reversed';
    is_adjusting: boolean;
    posted_at: string | null;
    lines: Line[];
}

interface Props extends PageProps {
    entry: JournalEntry;
}

const STATUS_BADGE: Record<string, string> = {
    draft:    'bg-slate-100 text-slate-600',
    posted:   'bg-green-100 text-green-700',
    reversed: 'bg-orange-100 text-orange-700',
};

export default function JournalEntryShow({ entry }: Props) {
    const { flash } = usePage<PageProps>().props as any;

    const totalDebits  = entry.lines.reduce((s, l) => s + (l.debit  || 0), 0);
    const totalCredits = entry.lines.reduce((s, l) => s + (l.credit || 0), 0);

    function postEntry() {
        router.post(`/accounting/journal-entries/${entry.id}/post`);
    }

    function reverseEntry() {
        if (confirm('Are you sure you want to reverse this journal entry?')) {
            router.post(`/accounting/journal-entries/${entry.id}/reverse`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Journal Entry ${entry.entry_number ?? entry.id}`} />
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {entry.entry_number ?? `Journal Entry #${entry.id}`}
                        </h1>
                        <div className="mt-1 flex items-center gap-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[entry.status] ?? ''}`}>
                                {entry.status}
                            </span>
                            <span className="text-sm text-slate-500">{entry.entry_date}</span>
                            {entry.is_adjusting && (
                                <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700">
                                    Adjusting
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {entry.status === 'draft' && (
                            <Button onClick={postEntry}>Post Entry</Button>
                        )}
                        {entry.status === 'posted' && (
                            <Button variant="secondary" onClick={reverseEntry}>Reverse</Button>
                        )}
                        <Button href="/accounting/journal-entries" variant="secondary">Back</Button>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}

                {/* Header info */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-slate-500">Reference</span>
                        <p className="text-slate-900 mt-0.5">{entry.reference ?? '—'}</p>
                    </div>
                    <div>
                        <span className="font-medium text-slate-500">Description</span>
                        <p className="text-slate-900 mt-0.5">{entry.description ?? '—'}</p>
                    </div>
                    <div>
                        <span className="font-medium text-slate-500">Posted At</span>
                        <p className="text-slate-900 mt-0.5">{entry.posted_at ?? '—'}</p>
                    </div>
                </div>

                {/* Lines */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Account</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Debit</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {entry.lines.map((line) => (
                                <tr key={line.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-slate-700">
                                        {line.account ? `${line.account.code} — ${line.account.name}` : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{line.description ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-900">
                                        {line.debit > 0 ? line.debit.toFixed(2) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-900">
                                        {line.credit > 0 ? line.credit.toFixed(2) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                                <td colSpan={2} className="px-4 py-3 text-right text-slate-700">Total</td>
                                <td className="px-4 py-3 text-right font-mono text-slate-900">{totalDebits.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right font-mono text-slate-900">{totalCredits.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

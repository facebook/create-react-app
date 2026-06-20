import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { JournalEntryStatusBadge } from '@/Components/Finance/JournalEntryStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { JournalEntry } from '@/types/finance';

interface Props extends PageProps { entry: JournalEntry; }

export default function JournalEntryShow({ entry }: Props) {
    const { can } = usePermission();

    function handlePost() {
        if (!confirm('Post this journal entry? This action cannot be undone.')) return;
        router.patch(`/finance/journal-entries/${entry.id}/post`);
    }

    return (
        <AppLayout>
            <Head title={`JE #${entry.id}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Journal Entry #{entry.id}</h1>
                        <div className="mt-1 flex items-center gap-3">
                            <JournalEntryStatusBadge status={entry.status} />
                            <span className="text-sm text-slate-500">{entry.date}</span>
                            {entry.reference && <span className="text-sm text-slate-500">Ref: {entry.reference}</span>}
                        </div>
                    </div>
                    {entry.status === 'draft' && can('finance.update') && (
                        <Button onClick={handlePost}>Post Entry</Button>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                    <p className="text-sm font-medium text-slate-700 mb-4">{entry.description}</p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Account</th>
                                    <th className="px-4 py-2 text-left font-medium">Description</th>
                                    <th className="px-4 py-2 text-right font-medium">Debit</th>
                                    <th className="px-4 py-2 text-right font-medium">Credit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(entry.lines ?? []).map((line, i) => (
                                    <tr key={line.id ?? i}>
                                        <td className="px-4 py-3">
                                            {line.account ? (
                                                <span>
                                                    <span className="font-mono text-xs text-slate-500 mr-2">{line.account.code}</span>
                                                    <span className="text-slate-800">{line.account.name}</span>
                                                </span>
                                            ) : `Account #${line.account_id}`}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{line.description ?? '—'}</td>
                                        <td className="px-4 py-3 text-right">
                                            {Number(line.debit) > 0 ? Number(line.debit).toFixed(2) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {Number(line.credit) > 0 ? Number(line.credit).toFixed(2) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-medium">
                                <tr>
                                    <td colSpan={2} className="px-4 py-2 text-right text-sm">Totals</td>
                                    <td className="px-4 py-2 text-right">{Number(entry.total_debits ?? 0).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right">{Number(entry.total_credits ?? 0).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {entry.creator && (
                        <p className="mt-4 text-xs text-slate-400">Created by {entry.creator.name}</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

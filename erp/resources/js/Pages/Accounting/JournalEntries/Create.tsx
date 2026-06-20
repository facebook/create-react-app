import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Account {
    id: number;
    code: string;
    name: string;
    type: string;
}

interface Period {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
}

interface Props extends PageProps {
    accounts: Account[];
    periods: Period[];
}

interface Line {
    account_id: number | '';
    description: string;
    debit: string;
    credit: string;
}

export default function JournalEntryCreate({ accounts, periods }: Props) {
    const [header, setHeader] = useState({
        reference:   '',
        description: '',
        entry_date:  new Date().toISOString().slice(0, 10),
        period_id:   '',
    });

    const [lines, setLines] = useState<Line[]>([
        { account_id: '', description: '', debit: '', credit: '' },
        { account_id: '', description: '', debit: '', credit: '' },
    ]);
    const [processing, setProcessing] = useState(false);

    const totalDebits  = lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0);
    const totalCredits = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
    const difference   = Math.abs(totalDebits - totalCredits);
    const isBalanced   = difference < 0.01 && totalDebits > 0;

    function updateLine(i: number, field: keyof Line, value: string | number) {
        const next = [...lines];
        next[i] = { ...next[i], [field]: value };
        setLines(next);
    }

    function addLine() {
        setLines([...lines, { account_id: '', description: '', debit: '', credit: '' }]);
    }

    function removeLine(i: number) {
        if (lines.length <= 2) return;
        setLines(lines.filter((_, idx) => idx !== i));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/accounting/journal-entries', {
            ...header,
            lines: lines.map((l) => ({
                account_id:  l.account_id,
                description: l.description,
                debit:       parseFloat(l.debit)  || 0,
                credit:      parseFloat(l.credit) || 0,
            })),
        } as any, {
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AppLayout>
            <Head title="New Journal Entry" />
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Journal Entry</h1>
                <form onSubmit={submit} className="space-y-6">
                    {/* Header */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-700 mb-4">Entry Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={header.entry_date}
                                    onChange={(e) => setHeader({ ...header, entry_date: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                                <input
                                    type="text"
                                    value={header.reference}
                                    onChange={(e) => setHeader({ ...header, reference: e.target.value })}
                                    placeholder="e.g. INV-001"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={header.description}
                                    onChange={(e) => setHeader({ ...header, description: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
                                <select
                                    value={header.period_id}
                                    onChange={(e) => setHeader({ ...header, period_id: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                >
                                    <option value="">No Period</option>
                                    {periods.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Lines */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-700">Journal Lines</h2>
                            <Button type="button" variant="secondary" size="sm" onClick={addLine}>Add Line</Button>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-3 py-2 text-left font-medium text-slate-600 w-1/3">Account</th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-600">Description</th>
                                    <th className="px-3 py-2 text-right font-medium text-slate-600 w-28">Debit</th>
                                    <th className="px-3 py-2 text-right font-medium text-slate-600 w-28">Credit</th>
                                    <th className="px-3 py-2 w-8" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lines.map((line, i) => (
                                    <tr key={i}>
                                        <td className="px-3 py-2">
                                            <select
                                                value={line.account_id}
                                                onChange={(e) => updateLine(i, 'account_id', e.target.value ? Number(e.target.value) : '')}
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                            >
                                                <option value="">Select account...</option>
                                                {accounts.map((a) => (
                                                    <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={line.description}
                                                onChange={(e) => updateLine(i, 'description', e.target.value)}
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={line.debit}
                                                onChange={(e) => updateLine(i, 'debit', e.target.value)}
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-right"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={line.credit}
                                                onChange={(e) => updateLine(i, 'credit', e.target.value)}
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-right"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeLine(i)}
                                                disabled={lines.length <= 2}
                                                className="text-red-400 hover:text-red-600 disabled:opacity-30 text-xs"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-slate-200 bg-slate-50">
                                    <td colSpan={2} className="px-3 py-2 text-right text-sm font-semibold text-slate-700">Totals</td>
                                    <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900">
                                        {totalDebits.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900">
                                        {totalCredits.toFixed(2)}
                                    </td>
                                    <td />
                                </tr>
                                {!isBalanced && totalDebits > 0 && (
                                    <tr className="bg-red-50">
                                        <td colSpan={5} className="px-3 py-2 text-center text-sm font-medium text-red-600">
                                            Difference: {difference.toFixed(2)} — Entry is not balanced
                                        </td>
                                    </tr>
                                )}
                                {isBalanced && (
                                    <tr className="bg-green-50">
                                        <td colSpan={5} className="px-3 py-2 text-center text-sm font-medium text-green-600">
                                            Entry is balanced
                                        </td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button href="/accounting/journal-entries" variant="secondary">Cancel</Button>
                        <Button type="submit" disabled={processing}>Save as Draft</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

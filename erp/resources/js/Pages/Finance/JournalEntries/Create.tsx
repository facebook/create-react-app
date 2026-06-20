import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Account } from '@/types/finance';

interface Props extends PageProps {
    accounts: Pick<Account, 'id' | 'code' | 'name' | 'type'>[];
}

interface Line {
    account_id: number | '';
    debit: string;
    credit: string;
    description: string;
}

export default function JournalEntryCreate({ accounts }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        date:        new Date().toISOString().slice(0, 10),
        reference:   '',
        description: '',
        lines:       [] as Line[],
    });

    const [lines, setLines] = useState<Line[]>([
        { account_id: '', debit: '', credit: '', description: '' },
        { account_id: '', debit: '', credit: '', description: '' },
    ]);

    const totalDebits  = lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0);
    const totalCredits = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
    const isBalanced   = Math.abs(totalDebits - totalCredits) < 0.001 && totalDebits > 0;

    function updateLine(index: number, field: keyof Line, value: string | number) {
        const next = [...lines];
        next[index] = { ...next[index], [field]: value };
        setLines(next);
    }

    function addLine() {
        setLines([...lines, { account_id: '', debit: '', credit: '', description: '' }]);
    }

    function removeLine(index: number) {
        if (lines.length <= 2) return;
        setLines(lines.filter((_, i) => i !== index));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            ...data,
            lines: lines.map((l) => ({
                account_id:  l.account_id,
                debit:       parseFloat(l.debit)  || 0,
                credit:      parseFloat(l.credit) || 0,
                description: l.description,
            })),
        };
        router.post('/finance/journal-entries', payload as any);
    }

    return (
        <AppLayout>
            <Head title="New Journal Entry" />
            <div className="mx-auto max-w-4xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Journal Entry</h1>
                <form onSubmit={submit} className="space-y-6">
                    {/* Header */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
                                <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                                <input value={data.reference} onChange={(e) => setData('reference', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="col-span-3 sm:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                                <input value={data.description} onChange={(e) => setData('description', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Lines */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-3 bg-slate-50">
                            <h2 className="text-sm font-medium text-slate-700">Journal Lines</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Account</th>
                                    <th className="px-4 py-2 text-left font-medium">Description</th>
                                    <th className="px-4 py-2 text-right font-medium w-28">Debit</th>
                                    <th className="px-4 py-2 text-right font-medium w-28">Credit</th>
                                    <th className="px-2 py-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lines.map((line, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-2">
                                            <select value={line.account_id}
                                                onChange={(e) => updateLine(i, 'account_id', e.target.value ? Number(e.target.value) : '')}
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none">
                                                <option value="">Select account…</option>
                                                {accounts.map((a) => (
                                                    <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-2">
                                            <input value={line.description}
                                                onChange={(e) => updateLine(i, 'description', e.target.value)}
                                                placeholder="Optional…"
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input type="number" min="0" step="0.01" value={line.debit}
                                                onChange={(e) => updateLine(i, 'debit', e.target.value)}
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-indigo-500 focus:outline-none" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input type="number" min="0" step="0.01" value={line.credit}
                                                onChange={(e) => updateLine(i, 'credit', e.target.value)}
                                                className="w-full rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-indigo-500 focus:outline-none" />
                                        </td>
                                        <td className="px-2 py-2">
                                            <button type="button" onClick={() => removeLine(i)}
                                                className="text-slate-400 hover:text-red-500 disabled:opacity-30"
                                                disabled={lines.length <= 2}>✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                                <tr>
                                    <td colSpan={2} className="px-4 py-2">
                                        <button type="button" onClick={addLine}
                                            className="text-sm text-indigo-600 hover:text-indigo-800">+ Add line</button>
                                    </td>
                                    <td className="px-4 py-2 text-right font-medium">
                                        {totalDebits.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 text-right font-medium">
                                        {totalCredits.toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                                {!isBalanced && totalDebits > 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-1 text-xs text-red-500">
                                            Not balanced — difference: {Math.abs(totalDebits - totalCredits).toFixed(2)}
                                        </td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => history.back()}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Save Draft</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

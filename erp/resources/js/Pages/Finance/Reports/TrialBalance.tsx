import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import type { AccountType, TrialBalanceRow } from '@/types/finance';

interface Props extends PageProps { accounts: TrialBalanceRow[]; }

const TYPE_ORDER: AccountType[] = ['asset', 'liability', 'equity', 'income', 'expense'];

const TYPE_COLORS: Record<AccountType, string> = {
    asset:     'text-blue-700',
    liability: 'text-orange-700',
    equity:    'text-purple-700',
    income:    'text-green-700',
    expense:   'text-red-700',
};

export default function TrialBalance({ accounts }: Props) {
    const grouped = TYPE_ORDER.map((type) => ({
        type,
        rows: accounts.filter((a) => a.type === type),
    })).filter((g) => g.rows.length > 0);

    const totalDebit  = accounts.reduce((s, a) => s + a.total_debit,  0);
    const totalCredit = accounts.reduce((s, a) => s + a.total_credit, 0);
    const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.01;

    return (
        <AppLayout>
            <Head title="Trial Balance" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Trial Balance</h1>
                        <p className="text-sm text-slate-500 mt-1">Posted entries only</p>
                    </div>
                    {isBalanced ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            ✓ Balanced
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            Out of balance by {Math.abs(totalDebit - totalCredit).toFixed(2)}
                        </span>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium w-24">Code</th>
                                <th className="px-4 py-2 text-left font-medium">Account Name</th>
                                <th className="px-4 py-2 text-right font-medium w-32">Debit</th>
                                <th className="px-4 py-2 text-right font-medium w-32">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grouped.map(({ type, rows }) => (
                                <>
                                    <tr key={type} className="bg-slate-50">
                                        <td colSpan={4} className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${TYPE_COLORS[type]}`}>
                                            {type}
                                        </td>
                                    </tr>
                                    {rows.map((a) => (
                                        <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                                            <td className="px-4 py-2 font-mono text-slate-500">{a.code}</td>
                                            <td className="px-4 py-2 text-slate-800">
                                                {a.parent_name && <span className="text-slate-400 mr-1">› </span>}
                                                {a.name}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {a.total_debit > 0 ? a.total_debit.toFixed(2) : '—'}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {a.total_credit > 0 ? a.total_credit.toFixed(2) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                            <tr>
                                <td colSpan={2} className="px-4 py-3 text-slate-900">Total</td>
                                <td className="px-4 py-3 text-right text-slate-900">{totalDebit.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right text-slate-900">{totalCredit.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

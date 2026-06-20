import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface AgedRow {
    id: number;
    number?: string;
    contact: string;
    due_date?: string;
    amount_due: number;
    days_overdue: number;
    bucket: 'current' | '1-30' | '31-60' | '61-90' | '90+';
}

interface Props extends PageProps {
    rows: AgedRow[];
    totals: Record<string, number>;
    grand_total: number;
    as_of: string;
}

const BUCKET_STYLES: Record<string, string> = {
    current: 'bg-green-50 text-green-700 border-green-200',
    '1-30':  'bg-yellow-50 text-yellow-700 border-yellow-200',
    '31-60': 'bg-orange-50 text-orange-700 border-orange-200',
    '61-90': 'bg-red-50 text-red-700 border-red-200',
    '90+':   'bg-red-900/10 text-red-900 border-red-300',
};

const BUCKET_LABELS: Record<string, string> = {
    current: 'Current',
    '1-30':  '1–30 days',
    '31-60': '31–60 days',
    '61-90': '61–90 days',
    '90+':   '90+ days',
};

function fmt(n: number) {
    return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AgedPayablesSummary({ rows, totals, grand_total, as_of }: Props) {
    const [asOf, setAsOf] = useState(as_of);

    return (
        <AppLayout>
            <Head title="Aged Payables Summary" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Aged Payables Summary</h1>
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-slate-500">As of</label>
                        <input
                            type="date"
                            value={asOf}
                            onChange={(e) => setAsOf(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={() =>
                                router.get(
                                    '/finance/reports/aged-payables',
                                    { as_of: asOf },
                                    { preserveState: true, replace: true },
                                )
                            }
                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Apply
                        </button>
                        <a
                            href={`/finance/reports/aged-payables/export?as_of=${asOf}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                        >
                            Export CSV
                        </a>
                    </div>
                </div>

                {/* Bucket summary cards */}
                <div className="grid grid-cols-5 gap-3">
                    {(['current', '1-30', '31-60', '61-90', '90+'] as const).map((b) => (
                        <div key={b} className={`rounded-lg border p-4 ${BUCKET_STYLES[b]}`}>
                            <p className="mb-1 text-xs font-medium">{BUCKET_LABELS[b]}</p>
                            <p className="text-lg font-bold">{fmt(totals[b] ?? 0)}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Bill #</th>
                                <th className="px-4 py-2 text-left font-medium">Vendor</th>
                                <th className="px-4 py-2 text-left font-medium">Due Date</th>
                                <th className="px-4 py-2 text-right font-medium">Days Overdue</th>
                                <th className="px-4 py-2 text-right font-medium">Amount Due</th>
                                <th className="px-4 py-2 text-left font-medium">Bucket</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No outstanding bills.
                                    </td>
                                </tr>
                            )}
                            {rows.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-indigo-600">
                                        {row.number ?? `#${row.id}`}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{row.contact}</td>
                                    <td className="px-4 py-3 text-slate-500">{row.due_date ?? '—'}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">
                                        {row.days_overdue > 0 ? row.days_overdue : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                                        {fmt(row.amount_due)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${BUCKET_STYLES[row.bucket]}`}
                                        >
                                            {BUCKET_LABELS[row.bucket]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                            <tr>
                                <td colSpan={4} className="px-4 py-3 text-right font-semibold text-slate-700">
                                    Grand Total
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900">{fmt(grand_total)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface StatusSummary {
    status: string;
    count: number;
    total: number;
}

interface InvoiceRow {
    id: number;
    number: string;
    contact: string;
    issue_date: string;
    due_date: string | null;
    status: string;
    total: number;
    amount_due: number;
}

interface Props extends PageProps {
    rows?: InvoiceRow[];
    summary?: StatusSummary[];
    grand_total?: number;
    from: string;
    to: string;
}

const STATUS_BADGES: Record<string, string> = {
    draft:    'bg-slate-100 text-slate-600',
    sent:     'bg-blue-100 text-blue-700',
    partial:  'bg-yellow-100 text-yellow-700',
    paid:     'bg-green-100 text-green-700',
    overdue:  'bg-red-100 text-red-700',
    cancelled:'bg-slate-200 text-slate-500',
};

function fmt(n: number) {
    return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InvoiceSummary({ rows = [], summary = [], grand_total = 0, from, to }: Props) {
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo, setDateTo] = useState(to);

    function applyFilter() {
        router.get('/finance/reports/invoices', { from: dateFrom, to: dateTo }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Invoice Summary" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Invoice Summary</h1>
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-slate-500">From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <label className="text-sm text-slate-500">To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={applyFilter}
                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* Status summary cards */}
                {summary.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {summary.map((s) => (
                            <div key={s.status} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-medium capitalize text-slate-500">{s.status}</p>
                                <p className="mt-1 text-xl font-bold text-slate-800">{fmt(s.total)}</p>
                                <p className="mt-0.5 text-xs text-slate-400">{s.count} invoices</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <h2 className="text-sm font-medium text-slate-700">Invoices</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Invoice #</th>
                                <th className="px-4 py-2 text-left font-medium">Customer</th>
                                <th className="px-4 py-2 text-left font-medium">Issue Date</th>
                                <th className="px-4 py-2 text-left font-medium">Due Date</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                <th className="px-4 py-2 text-right font-medium">Total</th>
                                <th className="px-4 py-2 text-right font-medium">Amount Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No invoices for this period.
                                    </td>
                                </tr>
                            )}
                            {rows.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-indigo-600">
                                        <a href={`/finance/invoices/${row.id}`} className="hover:underline">
                                            {row.number}
                                        </a>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{row.contact}</td>
                                    <td className="px-4 py-3 text-slate-500">{row.issue_date}</td>
                                    <td className="px-4 py-3 text-slate-500">{row.due_date ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[row.status] ?? 'bg-slate-100 text-slate-600'}`}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900">{fmt(row.total)}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{fmt(row.amount_due)}</td>
                                </tr>
                            ))}
                        </tbody>
                        {grand_total > 0 && (
                            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                                <tr>
                                    <td colSpan={5} className="px-4 py-3 text-right font-semibold text-slate-700">
                                        Grand Total
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900">{fmt(grand_total)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

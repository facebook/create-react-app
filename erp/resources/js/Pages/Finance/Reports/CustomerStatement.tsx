import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface ContactInfo { id: number; name: string; email?: string | null; }

interface StatementLine {
    date: string;
    type: string;
    reference: string | null;
    debit: number;
    credit: number;
    balance: number;
    status: string;
}

interface Summary {
    opening_balance: number;
    total_invoiced: number;
    total_paid: number;
    closing_balance: number;
}

// Legacy row format (used by path-based route)
interface StatementRow {
    date: string;
    type: string;
    reference?: string | null;
    debit: number;
    credit: number;
    balance: number;
}

interface Props extends PageProps {
    contacts: ContactInfo[];
    contact: ContactInfo | null;
    // New format (query-param based)
    lines?: StatementLine[];
    summary?: Summary | null;
    // Legacy format (path-based)
    rows?: StatementRow[];
    total_debit?: number;
    total_credit?: number;
    closing_balance?: number;
    from: string;
    to: string;
}

function fmt(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CustomerStatement({
    contacts, contact, lines, summary, rows, total_debit, total_credit, closing_balance, from, to,
}: Props) {
    const [contactId, setContactId] = useState(contact?.id?.toString() ?? '');
    const [fromDate, setFromDate] = useState(from);
    const [toDate, setToDate] = useState(to);

    // Determine if we're using new (lines/summary) or legacy (rows) format
    const isNewFormat = lines !== undefined;

    function load() {
        if (!contactId) return;
        router.get('/finance/reports/customer-statement', {
            contact_id: contactId,
            from: fromDate,
            to: toDate,
        }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Customer Statement" />
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h1 className="text-2xl font-bold text-slate-800">Customer Statement</h1>
                    {contact && summary && (
                        <a
                            href={`/finance/reports/customer-statement/export?contact_id=${contactId}&from=${fromDate}&to=${toDate}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            Export CSV
                        </a>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-end bg-white border border-slate-200 rounded-lg p-4">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Customer</label>
                        <select
                            value={contactId}
                            onChange={e => setContactId(e.target.value)}
                            className="rounded border border-slate-300 px-3 py-1.5 text-sm min-w-48"
                        >
                            <option value="">— Select —</option>
                            {contacts.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">From</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                            className="rounded border border-slate-300 px-3 py-1.5 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">To</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                            className="rounded border border-slate-300 px-3 py-1.5 text-sm"
                        />
                    </div>
                    <button
                        onClick={load}
                        className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        View
                    </button>
                </div>

                {contact && isNewFormat && summary && (
                    <>
                        {/* Contact header */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <p className="font-semibold text-slate-800">{contact.name}</p>
                            {contact.email && <p className="text-sm text-slate-500">{contact.email}</p>}
                            <p className="text-xs text-slate-400 mt-1">{fromDate} — {toDate}</p>
                        </div>

                        {/* Summary cards */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Opening Balance', value: summary.opening_balance },
                                { label: 'Total Invoiced',  value: summary.total_invoiced,  green: true },
                                { label: 'Total Paid',      value: summary.total_paid,       blue: true },
                                { label: 'Closing Balance', value: summary.closing_balance,  bold: true },
                            ].map(({ label, value, green, blue, bold }) => (
                                <div key={label} className="bg-white border border-slate-200 rounded-lg p-4">
                                    <p className="text-xs text-slate-500">{label}</p>
                                    <p className={`text-xl font-${bold ? 'bold' : 'semibold'} mt-1 ${green ? 'text-green-700' : blue ? 'text-blue-700' : 'text-slate-800'}`}>
                                        {fmt(value)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Statement lines */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lines!.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                                No transactions in this period.
                                            </td>
                                        </tr>
                                    )}
                                    {lines!.map((line, i) => (
                                        <tr key={i} className={`hover:bg-slate-50 ${line.type === 'Payment' ? 'bg-green-50/30' : ''}`}>
                                            <td className="px-4 py-2 text-slate-600">{line.date}</td>
                                            <td className="px-4 py-2">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${line.type === 'Invoice' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                    {line.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-slate-700 font-medium">{line.reference}</td>
                                            <td className="px-4 py-2 text-right text-red-700">{line.debit > 0 ? fmt(line.debit) : ''}</td>
                                            <td className="px-4 py-2 text-right text-green-700">{line.credit > 0 ? fmt(line.credit) : ''}</td>
                                            <td className="px-4 py-2 text-right font-semibold text-slate-800">{fmt(line.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Legacy format (path-based route) */}
                {contact && !isNewFormat && rows && (
                    <>
                        <div className="text-sm text-slate-600">
                            Statement for <span className="font-medium">{contact.name}</span>
                            <span className="ml-2 text-slate-400">({from} → {to})</span>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Date</th>
                                        <th className="px-4 py-2 text-left font-medium">Type</th>
                                        <th className="px-4 py-2 text-left font-medium">Reference</th>
                                        <th className="px-4 py-2 text-right font-medium">Debit</th>
                                        <th className="px-4 py-2 text-right font-medium">Credit</th>
                                        <th className="px-4 py-2 text-right font-medium">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rows.length === 0 && (
                                        <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No transactions in this period.</td></tr>
                                    )}
                                    {rows.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{row.date}</td>
                                            <td className="px-4 py-2 text-slate-700">{row.type}</td>
                                            <td className="px-4 py-2 text-slate-500 font-mono text-xs">{row.reference ?? '—'}</td>
                                            <td className="px-4 py-2 text-right text-slate-600">{row.debit > 0 ? fmt(row.debit) : ''}</td>
                                            <td className="px-4 py-2 text-right text-slate-600">{row.credit > 0 ? fmt(row.credit) : ''}</td>
                                            <td className={`px-4 py-2 text-right font-medium ${row.balance < 0 ? 'text-green-600' : 'text-slate-900'}`}>
                                                {fmt(Math.abs(row.balance))}{row.balance < 0 ? ' Cr' : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                                    <tr className="font-semibold">
                                        <td colSpan={3} className="px-4 py-2 text-right text-slate-900">Totals</td>
                                        <td className="px-4 py-2 text-right text-slate-900">{fmt(total_debit ?? 0)}</td>
                                        <td className="px-4 py-2 text-right text-slate-900">{fmt(total_credit ?? 0)}</td>
                                        <td className="px-4 py-2 text-right text-slate-900">{fmt(Math.abs(closing_balance ?? 0))}{(closing_balance ?? 0) < 0 ? ' Cr' : ''}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="flex justify-end">
                            <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm text-right">
                                <p className="text-xs text-slate-500">Closing Balance</p>
                                <p className="text-xl font-semibold text-slate-900">
                                    {fmt(Math.abs(closing_balance ?? 0))}{(closing_balance ?? 0) < 0 ? ' Cr' : ''}
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {!contact && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-slate-400">
                        Select a customer to view their statement.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

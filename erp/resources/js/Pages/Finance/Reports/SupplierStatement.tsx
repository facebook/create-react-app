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
    total_billed: number;
    total_paid: number;
    closing_balance: number;
}

interface Props extends PageProps {
    contacts: ContactInfo[];
    contact: ContactInfo | null;
    lines: StatementLine[];
    summary: Summary | null;
    from: string;
    to: string;
}

function fmt(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SupplierStatement({
    contacts, contact, lines, summary, from, to,
}: Props) {
    const [contactId, setContactId] = useState(contact?.id?.toString() ?? '');
    const [fromDate, setFromDate] = useState(from);
    const [toDate, setToDate] = useState(to);

    function load() {
        if (!contactId) return;
        router.get('/finance/reports/supplier-statement', {
            contact_id: contactId,
            from: fromDate,
            to: toDate,
        }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Supplier Statement" />
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h1 className="text-2xl font-bold text-slate-800">Supplier Statement</h1>
                    {contact && summary && (
                        <a
                            href={`/finance/reports/supplier-statement/export?contact_id=${contactId}&from=${fromDate}&to=${toDate}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            Export CSV
                        </a>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-end bg-white border border-slate-200 rounded-lg p-4">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Supplier</label>
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

                {contact && summary && (
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
                                { label: 'Total Billed',    value: summary.total_billed,    green: true },
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
                                    {lines.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                                No transactions in this period.
                                            </td>
                                        </tr>
                                    )}
                                    {lines.map((line, i) => (
                                        <tr key={i} className={`hover:bg-slate-50 ${line.type === 'Payment' ? 'bg-green-50/30' : ''}`}>
                                            <td className="px-4 py-2 text-slate-600">{line.date}</td>
                                            <td className="px-4 py-2">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${line.type === 'Bill' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
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

                {!contact && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-slate-400">
                        Select a supplier to view their statement.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

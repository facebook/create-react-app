import { Head, Link } from '@inertiajs/react';
import type { PageProps } from '@/types';
import type { Invoice } from '@/types/finance';

interface Props extends PageProps {
    invoice: Invoice;
    company: string;
    currency: string;
}

function fmt(n: number | string | undefined, currency = 'USD'): string {
    if (n === undefined || n === null) return '—';
    return `${currency} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_LABELS: Record<string, string> = {
    draft: 'DRAFT', sent: 'SENT', paid: 'PAID', cancelled: 'CANCELLED',
};

const STATUS_COLORS: Record<string, string> = {
    draft: 'text-slate-500 border-slate-300',
    sent:  'text-blue-600 border-blue-400',
    paid:  'text-green-600 border-green-500',
    cancelled: 'text-red-500 border-red-400',
};

export default function InvoicePrint({ invoice, company, currency }: Props) {
    return (
        <>
            <Head title={`${invoice.number ?? 'Invoice'} — Print`} />

            {/* Print controls — hidden when printing */}
            <div className="print:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between bg-slate-800 px-6 py-3">
                <Link href={`/finance/invoices/${invoice.id}`}
                    className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
                    ← Back to Invoice
                </Link>
                <button
                    onClick={() => window.print()}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    Print / Save PDF
                </button>
            </div>

            {/* Invoice content */}
            <div className="min-h-screen bg-white print:bg-white pt-14 print:pt-0">
                <div className="mx-auto max-w-3xl px-8 py-10 print:py-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-10">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{company}</h1>
                            <p className="text-sm text-slate-500 mt-1">Tax Invoice</p>
                        </div>
                        <div className="text-right">
                            <div className={`inline-block border-2 rounded px-3 py-1 text-sm font-bold tracking-wider ${STATUS_COLORS[invoice.status] ?? 'text-slate-500 border-slate-300'}`}>
                                {STATUS_LABELS[invoice.status] ?? invoice.status.toUpperCase()}
                            </div>
                            <p className="text-2xl font-bold text-slate-900 mt-2">{invoice.number}</p>
                        </div>
                    </div>

                    {/* Meta row */}
                    <div className="grid grid-cols-3 gap-6 mb-10 text-sm">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Billed To</p>
                            <p className="font-medium text-slate-900">{invoice.contact?.name ?? 'No contact'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Issue Date</p>
                            <p className="text-slate-700">{invoice.issue_date ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Due Date</p>
                            <p className={`font-medium ${invoice.is_overdue ? 'text-red-600' : 'text-slate-700'}`}>
                                {invoice.due_date ?? '—'}
                                {invoice.is_overdue && ' (Overdue)'}
                            </p>
                        </div>
                    </div>

                    {/* Line items */}
                    <table className="w-full text-sm mb-8">
                        <thead>
                            <tr className="border-b-2 border-slate-300">
                                <th className="text-left py-2 font-semibold text-slate-700">Description</th>
                                <th className="text-right py-2 font-semibold text-slate-700 w-20">Qty</th>
                                <th className="text-right py-2 font-semibold text-slate-700 w-28">Unit Price</th>
                                <th className="text-right py-2 font-semibold text-slate-700 w-20">Tax %</th>
                                <th className="text-right py-2 font-semibold text-slate-700 w-28">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(invoice.items ?? []).map((item) => (
                                <tr key={item.id} className="border-b border-slate-100">
                                    <td className="py-2.5 text-slate-700">{item.description}</td>
                                    <td className="py-2.5 text-right text-slate-600">{item.quantity}</td>
                                    <td className="py-2.5 text-right text-slate-600">{fmt(item.unit_price, currency)}</td>
                                    <td className="py-2.5 text-right text-slate-500">{item.tax_rate}%</td>
                                    <td className="py-2.5 text-right font-medium text-slate-900">{fmt(item.line_total, currency)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-64 space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{fmt(invoice.subtotal, currency)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Tax</span>
                                <span>{fmt(invoice.tax_total, currency)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-2 text-base">
                                <span>Total</span>
                                <span>{fmt(invoice.total, currency)}</span>
                            </div>
                            {(invoice.amount_paid ?? 0) > 0 && (
                                <>
                                    <div className="flex justify-between text-green-600">
                                        <span>Amount Paid</span>
                                        <span>({fmt(invoice.amount_paid, currency)})</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-2">
                                        <span>Balance Due</span>
                                        <span>{fmt(invoice.amount_due, currency)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Payment history */}
                    {(invoice.payments ?? []).length > 0 && (
                        <div className="mb-8">
                            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Payment History</p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-1.5 font-medium text-slate-600">Date</th>
                                        <th className="text-left py-1.5 font-medium text-slate-600">Method</th>
                                        <th className="text-left py-1.5 font-medium text-slate-600">Reference</th>
                                        <th className="text-right py-1.5 font-medium text-slate-600">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.payments!.map((p) => (
                                        <tr key={p.id} className="border-b border-slate-100">
                                            <td className="py-1.5 text-slate-600">{p.payment_date}</td>
                                            <td className="py-1.5 capitalize text-slate-600">{p.method}</td>
                                            <td className="py-1.5 text-slate-500">{p.reference ?? '—'}</td>
                                            <td className="py-1.5 text-right text-slate-900">{fmt(p.amount, currency)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="text-sm text-slate-500 border-t border-slate-200 pt-4">
                            <p className="font-semibold text-slate-600 mb-1">Notes</p>
                            <p>{invoice.notes}</p>
                        </div>
                    )}

                    <p className="text-xs text-slate-400 mt-10 print:block">Generated by {company}</p>
                </div>
            </div>
        </>
    );
}

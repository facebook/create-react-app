import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { BillStatusBadge } from '@/Components/Finance/BillStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Bill, BillStatus, PaymentMethod } from '@/types/finance';
import AttachmentPanel from '@/Components/Finance/AttachmentPanel';

interface Props extends PageProps { bill: Bill; }

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash',          label: 'Cash' },
    { value: 'cheque',        label: 'Cheque' },
    { value: 'card',          label: 'Card' },
    { value: 'other',         label: 'Other' },
];

export default function BillShow({ bill }: Props) {
    const { can } = usePermission();
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [payment, setPayment] = useState({
        amount: String(bill.amount_due ?? bill.total ?? ''),
        payment_date: new Date().toISOString().slice(0, 10),
        method: 'bank_transfer' as PaymentMethod,
        reference: '',
        notes: '',
    });

    function transition(status: BillStatus) {
        const confirmMsg = status === 'cancelled'
            ? 'Cancel this bill? This action cannot be undone.'
            : `Mark bill as ${status}?`;
        if (!confirm(confirmMsg)) return;

        const endpoint = status === 'received'
            ? `/finance/bills/${bill.id}/receive`
            : `/finance/bills/${bill.id}/cancel`;
        router.patch(endpoint);
    }

    function submitPayment(e: React.FormEvent) {
        e.preventDefault();
        router.post(`/finance/bills/${bill.id}/payments`, payment as any, {
            onSuccess: () => setShowPaymentForm(false),
        });
    }

    const [showEmail, setShowEmail] = useState(false);
    const { data: emailData, setData: setEmailData, post: emailPost, processing: emailProcessing, errors: emailErrors, reset: emailReset } = useForm({ email: (bill.contact as any)?.email ?? '', message: '' });

    function submitEmail(e: React.FormEvent) {
        e.preventDefault();
        emailPost(`/finance/bills/${bill.id}/email`, { onSuccess: () => { setShowEmail(false); emailReset(); } });
    }

    const currencyCode = bill.currency_code ?? 'USD';
    const showCurrencyInfo = currencyCode !== 'USD';

    return (
        <AppLayout>
            <Head title={bill.number ?? `Bill #${bill.id}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {bill.number ?? `Bill #${bill.id}`}
                        </h1>
                        <div className="mt-1 flex items-center gap-3">
                            <BillStatusBadge status={bill.status} />
                            {bill.is_overdue && (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Overdue</span>
                            )}
                            <span className="text-sm text-slate-500">Issued: {bill.issue_date}</span>
                            {bill.due_date && <span className="text-sm text-slate-500">Due: {bill.due_date}</span>}
                            {showCurrencyInfo && (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                    {currencyCode}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={`/finance/bills/${bill.id}/pdf`}
                            download
                            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                        >
                            Download PDF
                        </a>
                        {can('finance.update') && (
                            <Button variant="secondary" onClick={() => setShowEmail((v) => !v)}>
                                {showEmail ? 'Cancel Email' : 'Email Bill'}
                            </Button>
                        )}
                        {can('finance.update') && (
                            <>
                                {(bill.transitions ?? []).filter(t => t !== 'paid').map((t) => (
                                    <Button key={t}
                                        variant={t === 'cancelled' ? 'secondary' : 'primary'}
                                        onClick={() => transition(t as BillStatus)}>
                                        {t === 'received' ? 'Mark as Received' : t === 'cancelled' ? 'Cancel' : t}
                                    </Button>
                                ))}
                                {bill.status === 'received' && Number(bill.amount_due ?? 0) > 0 && (
                                    <Button onClick={() => setShowPaymentForm(!showPaymentForm)}>Record Payment</Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Contact */}
                {bill.contact && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Bill From</p>
                        <p className="font-medium text-slate-900">{bill.contact.name}</p>
                    </div>
                )}

                {/* Currency info */}
                {showCurrencyInfo && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
                        <div className="flex gap-6 text-sm">
                            <div>
                                <span className="text-blue-600 font-medium">Currency: </span>
                                <span className="text-blue-900">{currencyCode}</span>
                            </div>
                            <div>
                                <span className="text-blue-600 font-medium">Exchange Rate: </span>
                                <span className="text-blue-900">{Number(bill.exchange_rate ?? 1).toFixed(6)}</span>
                            </div>
                            {bill.base_total !== undefined && (
                                <div>
                                    <span className="text-blue-600 font-medium">Base Total (USD): </span>
                                    <span className="text-blue-900 font-semibold">
                                        ${Number(bill.base_total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Line items */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Description</th>
                                <th className="px-4 py-2 text-right font-medium">Qty</th>
                                <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                                <th className="px-4 py-2 text-right font-medium">Tax</th>
                                <th className="px-4 py-2 text-right font-medium">Line Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(bill.items ?? []).map((item, i) => (
                                <tr key={item.id ?? i}>
                                    <td className="px-4 py-3">{item.description}</td>
                                    <td className="px-4 py-3 text-right">{Number(item.quantity).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{Number(item.unit_price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{Number(item.tax_rate).toFixed(1)}%</td>
                                    <td className="px-4 py-3 text-right font-medium">{Number(item.line_total ?? 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                            <tr>
                                <td colSpan={4} className="px-4 py-2 text-right text-sm text-slate-500">Subtotal</td>
                                <td className="px-4 py-2 text-right">{Number(bill.subtotal ?? 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="px-4 py-2 text-right text-sm text-slate-500">Tax</td>
                                <td className="px-4 py-2 text-right">{Number(bill.tax_total ?? 0).toFixed(2)}</td>
                            </tr>
                            <tr className="font-semibold">
                                <td colSpan={4} className="px-4 py-2 text-right text-slate-900">Total</td>
                                <td className="px-4 py-2 text-right text-slate-900">{Number(bill.total ?? 0).toFixed(2)}</td>
                            </tr>
                            {(bill.amount_paid ?? 0) > 0 && (
                                <>
                                    <tr className="text-green-700">
                                        <td colSpan={4} className="px-4 py-2 text-right text-sm">Amount Paid</td>
                                        <td className="px-4 py-2 text-right">({Number(bill.amount_paid ?? 0).toFixed(2)})</td>
                                    </tr>
                                    <tr className="font-semibold">
                                        <td colSpan={4} className="px-4 py-2 text-right text-slate-900">Amount Due</td>
                                        <td className="px-4 py-2 text-right text-slate-900">{Number(bill.amount_due ?? 0).toFixed(2)}</td>
                                    </tr>
                                </>
                            )}
                        </tfoot>
                    </table>
                </div>

                {/* Payment history */}
                {(bill.payments ?? []).length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                            <h2 className="text-sm font-medium text-slate-700">Payment History</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Date</th>
                                    <th className="px-4 py-2 text-left font-medium">Method</th>
                                    <th className="px-4 py-2 text-left font-medium">Reference</th>
                                    <th className="px-4 py-2 text-right font-medium">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {bill.payments!.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3">{p.payment_date}</td>
                                        <td className="px-4 py-3 capitalize">{p.method.replaceAll('_', ' ')}</td>
                                        <td className="px-4 py-3 text-slate-500">{p.reference ?? '—'}</td>
                                        <td className="px-4 py-3 text-right font-medium">{Number(p.amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Record payment form */}
                {showPaymentForm && (
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-indigo-900 mb-4">Record Payment</h2>
                        <form onSubmit={submitPayment} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Amount <span className="text-red-500">*</span></label>
                                <input type="number" min="0.01" step="0.01" value={payment.amount}
                                    onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
                                <input type="date" value={payment.payment_date}
                                    onChange={(e) => setPayment({ ...payment, payment_date: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Method</label>
                                <select value={payment.method}
                                    onChange={(e) => setPayment({ ...payment, method: e.target.value as PaymentMethod })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                    {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Reference</label>
                                <input value={payment.reference}
                                    onChange={(e) => setPayment({ ...payment, reference: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div className="sm:col-span-4 flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => setShowPaymentForm(false)}>Cancel</Button>
                                <Button type="submit">Save Payment</Button>
                            </div>
                        </form>
                    </div>
                )}

                {showEmail && (
                    <form onSubmit={submitEmail} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Recipient Email</label>
                            <input type="email" required value={emailData.email} onChange={(e) => setEmailData('email', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                            {emailErrors.email && <p className="text-xs text-red-600 mt-1">{emailErrors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Message (optional)</label>
                            <textarea value={emailData.message} onChange={(e) => setEmailData('message', e.target.value)} rows={3}
                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setShowEmail(false)}>Cancel</Button>
                            <Button type="submit" disabled={emailProcessing}>{emailProcessing ? 'Sending…' : 'Send Email'}</Button>
                        </div>
                    </form>
                )}

                {bill.notes && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{bill.notes}</p>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <AttachmentPanel
                        attachments={bill.attachments ?? []}
                        modelType="bills"
                        modelId={bill.id}
                        canDelete={can('finance.delete')}
                    />
                </div>
            </div>
        </AppLayout>
    );
}

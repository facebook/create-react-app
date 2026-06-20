import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { QuoteStatusBadge } from '@/Components/Finance/QuoteStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Quote, QuoteStatus } from '@/types/finance';

interface Props extends PageProps { quote: Quote; }

export default function QuoteShow({ quote }: Props) {
    const { can } = usePermission();

    function transition(action: string) {
        const confirmMsg = action === 'declined' || action === 'cancelled'
            ? `Mark quote as ${action}? This action cannot be undone.`
            : `Mark quote as ${action}?`;
        if (!confirm(confirmMsg)) return;

        const endpoint = `/finance/quotes/${quote.id}/${action}`;
        router.patch(endpoint);
    }

    function convertToInvoice() {
        if (!confirm('Convert this quote to an invoice?')) return;
        router.post(`/finance/quotes/${quote.id}/convert`);
    }

    const [showEmail, setShowEmail] = useState(false);
    const { data: emailData, setData: setEmailData, post: emailPost, processing: emailProcessing, errors: emailErrors, reset: emailReset } = useForm({ email: (quote.contact as any)?.email ?? '', message: '' });

    function submitEmail(e: React.FormEvent) {
        e.preventDefault();
        emailPost(`/finance/quotes/${quote.id}/email`, { onSuccess: () => { setShowEmail(false); emailReset(); } });
    }

    const currencyCode = quote.currency_code ?? 'USD';
    const showCurrencyInfo = currencyCode !== 'USD';

    return (
        <AppLayout>
            <Head title={quote.number ?? `Quote #${quote.id}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {quote.number ?? `Quote #${quote.id}`}
                        </h1>
                        <div className="mt-1 flex items-center gap-3">
                            <QuoteStatusBadge status={quote.status} />
                            <span className="text-sm text-slate-500">Issued: {quote.issue_date}</span>
                            {quote.expiry_date && <span className="text-sm text-slate-500">Expires: {quote.expiry_date}</span>}
                            {showCurrencyInfo && (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                    {currencyCode}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                        <a
                            href={`/finance/quotes/${quote.id}/pdf`}
                            download
                            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                        >
                            Download PDF
                        </a>
                        {can('finance.update') && (
                            <Button variant="secondary" onClick={() => setShowEmail((v) => !v)}>
                                {showEmail ? 'Cancel Email' : 'Email Quote'}
                            </Button>
                        )}
                        {can('finance.update') && (
                            <>
                                {quote.status === 'draft' && (
                                    <>
                                        <Button onClick={() => transition('send')}>Send</Button>
                                        <Button variant="secondary" onClick={() => transition('declined')}>Cancel</Button>
                                    </>
                                )}
                                {quote.status === 'sent' && (
                                    <>
                                        <Button onClick={() => transition('accept')}>Accept</Button>
                                        <Button variant="secondary" onClick={() => transition('decline')}>Decline</Button>
                                        <Button variant="secondary" onClick={() => transition('declined')}>Cancel</Button>
                                    </>
                                )}
                                {quote.status === 'accepted' && (
                                    <Button onClick={convertToInvoice}>Convert to Invoice</Button>
                                )}
                            </>
                        )}
                        {can('finance.delete') && quote.status === 'draft' && (
                            <Button variant="secondary" onClick={() => {
                                if (confirm('Delete this quote?')) {
                                    router.delete(`/finance/quotes/${quote.id}`);
                                }
                            }}>Delete</Button>
                        )}
                    </div>
                </div>

                {/* Contact */}
                {quote.contact && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Customer</p>
                        <p className="font-medium text-slate-900">{quote.contact.name}</p>
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
                                <span className="text-blue-900">{Number(quote.exchange_rate ?? 1).toFixed(6)}</span>
                            </div>
                            {quote.base_total !== undefined && (
                                <div>
                                    <span className="text-blue-600 font-medium">Base Total (USD): </span>
                                    <span className="text-blue-900 font-semibold">
                                        ${Number(quote.base_total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                            {(quote.items ?? []).map((item, i) => (
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
                                <td className="px-4 py-2 text-right">{Number(quote.subtotal ?? 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="px-4 py-2 text-right text-sm text-slate-500">Tax</td>
                                <td className="px-4 py-2 text-right">{Number(quote.tax_total ?? 0).toFixed(2)}</td>
                            </tr>
                            <tr className="font-semibold">
                                <td colSpan={4} className="px-4 py-2 text-right text-slate-900">Total</td>
                                <td className="px-4 py-2 text-right text-slate-900">{Number(quote.total ?? 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

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

                {/* Notes */}
                {quote.notes && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{quote.notes}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

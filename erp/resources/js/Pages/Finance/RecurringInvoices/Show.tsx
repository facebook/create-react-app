import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { RecurringStatusBadge } from '@/Components/Finance/RecurringStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { RecurringInvoice } from '@/types/finance';

interface GeneratedInvoice {
    id: number;
    number?: string | null;
    issue_date: string;
    status: string;
}

interface Props extends PageProps {
    recurringInvoice: RecurringInvoice;
    generatedInvoices: GeneratedInvoice[];
}

export default function RecurringInvoiceShow({ recurringInvoice, generatedInvoices }: Props) {
    const { can } = usePermission();
    const ri = recurringInvoice;

    function generateNow() {
        if (!confirm('Generate an invoice now from this template?')) return;
        router.post(`/finance/recurring-invoices/${ri.id}/generate`);
    }

    function pause() {
        router.patch(`/finance/recurring-invoices/${ri.id}/pause`);
    }

    function resume() {
        router.patch(`/finance/recurring-invoices/${ri.id}/resume`);
    }

    return (
        <AppLayout>
            <Head title={`Recurring #${ri.id}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Recurring Invoice #{ri.id}
                        </h1>
                        <div className="mt-1 flex items-center gap-3">
                            <RecurringStatusBadge status={ri.status} />
                            {ri.contact && <span className="text-sm text-slate-500">{ri.contact.name}</span>}
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                        {can('finance.update') && (
                            <>
                                {ri.status === 'active' && (
                                    <>
                                        <Button onClick={generateNow}>Generate Now</Button>
                                        <Button variant="secondary" onClick={pause}>Pause</Button>
                                    </>
                                )}
                                {ri.status === 'paused' && (
                                    <Button onClick={resume}>Resume</Button>
                                )}
                            </>
                        )}
                        {can('finance.delete') && (
                            <Button variant="secondary" onClick={() => {
                                if (confirm('Delete this recurring invoice?')) {
                                    router.delete(`/finance/recurring-invoices/${ri.id}`);
                                }
                            }}>Delete</Button>
                        )}
                    </div>
                </div>

                {/* Schedule info */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                        <div>
                            <p className="text-xs text-slate-500">Frequency</p>
                            <p className="font-medium text-slate-900">{ri.frequency.charAt(0).toUpperCase() + ri.frequency.slice(1)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Next Run</p>
                            <p className="font-medium text-slate-900">{ri.next_run_date}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Start Date</p>
                            <p className="font-medium text-slate-900">{ri.start_date}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">End Date</p>
                            <p className="font-medium text-slate-900">{ri.end_date ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Due Days</p>
                            <p className="font-medium text-slate-900">{ri.due_days}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Auto-send</p>
                            <p className="font-medium text-slate-900">{ri.auto_send ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Generated</p>
                            <p className="font-medium text-slate-900">{ri.generated_count}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Last Generated</p>
                            <p className="font-medium text-slate-900">{ri.last_generated_at ?? '—'}</p>
                        </div>
                    </div>
                </div>

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
                            {(ri.items ?? []).map((item, i) => (
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
                                <td className="px-4 py-2 text-right">{Number(ri.subtotal ?? 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="px-4 py-2 text-right text-sm text-slate-500">Tax</td>
                                <td className="px-4 py-2 text-right">{Number(ri.tax_total ?? 0).toFixed(2)}</td>
                            </tr>
                            <tr className="font-semibold">
                                <td colSpan={4} className="px-4 py-2 text-right text-slate-900">Total</td>
                                <td className="px-4 py-2 text-right text-slate-900">{Number(ri.total ?? 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Recent invoices */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500 mb-2">Recent Invoices for this contact</p>
                    {generatedInvoices.length === 0 ? (
                        <p className="text-sm text-slate-400">No invoices yet.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {generatedInvoices.map((inv) => (
                                <li key={inv.id} className="flex items-center justify-between py-2 text-sm">
                                    <Link href={`/finance/invoices/${inv.id}`} className="font-mono text-indigo-600 hover:text-indigo-800">
                                        {inv.number ?? `#${inv.id}`}
                                    </Link>
                                    <span className="text-slate-500">{inv.issue_date}</span>
                                    <span className="text-slate-500">{inv.status}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Notes */}
                {ri.notes && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{ri.notes}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

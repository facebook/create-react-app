import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { SalesOrderStatusBadge } from '@/Components/Finance/SalesOrderStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { SalesOrder } from '@/types/finance';

interface Props extends PageProps { salesOrder: SalesOrder; }

export default function SalesOrderShow({ salesOrder }: Props) {
    const { can } = usePermission();

    function confirm_(action: string, method: 'patch' | 'post', message: string) {
        if (!confirm(message)) return;
        const endpoint = `/finance/sales-orders/${salesOrder.id}/${action}`;
        if (method === 'patch') router.patch(endpoint);
        else router.post(endpoint);
    }

    const canInvoice = (salesOrder.status === 'confirmed' || salesOrder.status === 'fulfilled') && !salesOrder.invoice;

    return (
        <AppLayout>
            <Head title={salesOrder.number ?? `Sales Order #${salesOrder.id}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {salesOrder.number ?? `Sales Order #${salesOrder.id}`}
                        </h1>
                        <div className="mt-1 flex items-center gap-3">
                            <SalesOrderStatusBadge status={salesOrder.status} />
                            <span className="text-sm text-slate-500">Order Date: {salesOrder.order_date}</span>
                            {salesOrder.expected_date && <span className="text-sm text-slate-500">Expected: {salesOrder.expected_date}</span>}
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                        {can('finance.update') && (
                            <>
                                {salesOrder.status === 'draft' && (
                                    <Button onClick={() => confirm_('confirm', 'patch', 'Confirm this sales order?')}>Confirm</Button>
                                )}
                                {salesOrder.status === 'confirmed' && (
                                    <Button onClick={() => confirm_('fulfill', 'post', 'Fulfill this order and deduct stock?')}>Fulfill</Button>
                                )}
                                {canInvoice && (
                                    <Button onClick={() => confirm_('convert', 'post', 'Create an invoice from this sales order?')}>Convert to Invoice</Button>
                                )}
                                {(salesOrder.status === 'draft' || salesOrder.status === 'confirmed') && (
                                    <Button variant="secondary" onClick={() => confirm_('cancel', 'patch', 'Cancel this sales order?')}>Cancel</Button>
                                )}
                            </>
                        )}
                        {can('finance.delete') && salesOrder.status === 'draft' && (
                            <Button variant="secondary" onClick={() => {
                                if (confirm('Delete this sales order?')) {
                                    router.delete(`/finance/sales-orders/${salesOrder.id}`);
                                }
                            }}>Delete</Button>
                        )}
                    </div>
                </div>

                {/* Meta cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {salesOrder.contact && (
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500 mb-1">Customer</p>
                            <p className="font-medium text-slate-900">{salesOrder.contact.name}</p>
                        </div>
                    )}
                    {salesOrder.warehouse && (
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500 mb-1">Warehouse</p>
                            <p className="font-medium text-slate-900">{salesOrder.warehouse.name}</p>
                        </div>
                    )}
                    {salesOrder.invoice && (
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500 mb-1">Invoice</p>
                            <Link href={`/finance/invoices/${salesOrder.invoice.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                {salesOrder.invoice.number ?? `Invoice #${salesOrder.invoice.id}`}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Line items */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Description</th>
                                <th className="px-4 py-2 text-right font-medium">Qty</th>
                                <th className="px-4 py-2 text-right font-medium">Fulfilled</th>
                                <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                                <th className="px-4 py-2 text-right font-medium">Tax</th>
                                <th className="px-4 py-2 text-right font-medium">Line Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(salesOrder.items ?? []).map((item, i) => (
                                <tr key={item.id ?? i}>
                                    <td className="px-4 py-3">
                                        {item.product_name ? (
                                            <span>
                                                <span className="font-medium text-slate-900">{item.product_name}</span>
                                                {item.product_sku && <span className="ml-1 text-xs text-slate-400">({item.product_sku})</span>}
                                                {item.description !== item.product_name && <div className="text-xs text-slate-500">{item.description}</div>}
                                            </span>
                                        ) : item.description}
                                    </td>
                                    <td className="px-4 py-3 text-right">{Number(item.quantity).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{Number(item.quantity_fulfilled ?? 0).toFixed(2)} / {Number(item.quantity).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{Number(item.unit_price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{Number(item.tax_rate).toFixed(1)}%</td>
                                    <td className="px-4 py-3 text-right font-medium">{Number(item.line_total ?? 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                            <tr>
                                <td colSpan={5} className="px-4 py-2 text-right text-sm text-slate-500">Subtotal</td>
                                <td className="px-4 py-2 text-right">{Number(salesOrder.subtotal ?? 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan={5} className="px-4 py-2 text-right text-sm text-slate-500">Tax</td>
                                <td className="px-4 py-2 text-right">{Number(salesOrder.tax_total ?? 0).toFixed(2)}</td>
                            </tr>
                            <tr className="font-semibold">
                                <td colSpan={5} className="px-4 py-2 text-right text-slate-900">Total</td>
                                <td className="px-4 py-2 text-right text-slate-900">{Number(salesOrder.total ?? 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Notes */}
                {salesOrder.notes && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{salesOrder.notes}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

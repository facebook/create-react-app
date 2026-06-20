import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { SalesOrder } from '@/types/inventory';

const STATUS_COLORS: Record<string, string> = {
    draft:     'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped:   'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

interface Props { order: SalesOrder & { customer?: { id: number; name: string } } }

export default function Show({ order }: Props) {
    const confirmForm  = useForm({});
    const shipForm     = useForm({});
    const deliverForm  = useForm({});
    const cancelForm   = useForm({});

    return (
        <AppLayout>
            <Head title={`SO ${order.so_number}`} />
            <div className="p-6 max-w-4xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{order.so_number}</h1>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-800'}`}>{order.status}</span>
                    </div>
                    <div className="flex gap-2">
                        {order.status === 'draft' && (
                            <Button onClick={() => confirmForm.post(`/inventory/sales-orders/${order.id}/confirm`)} disabled={confirmForm.processing}>Confirm</Button>
                        )}
                        {order.status === 'confirmed' && (
                            <Button onClick={() => shipForm.post(`/inventory/sales-orders/${order.id}/ship`)} disabled={shipForm.processing}>Ship</Button>
                        )}
                        {order.status === 'shipped' && (
                            <Button onClick={() => deliverForm.post(`/inventory/sales-orders/${order.id}/deliver`)} disabled={deliverForm.processing}>Deliver</Button>
                        )}
                        {['draft', 'confirmed'].includes(order.status) && (
                            <Button variant="outline" onClick={() => cancelForm.post(`/inventory/sales-orders/${order.id}/cancel`)} disabled={cancelForm.processing}>Cancel</Button>
                        )}
                        <Link href="/inventory/sales-orders"><Button variant="ghost">Back</Button></Link>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 bg-white rounded shadow p-4">
                    <div><span className="text-gray-500 text-sm">Customer</span><p>{order.customer?.name ?? '—'}</p></div>
                    <div><span className="text-gray-500 text-sm">Order Date</span><p>{order.order_date}</p></div>
                    <div><span className="text-gray-500 text-sm">Expected</span><p>{order.expected_date ?? '—'}</p></div>
                    <div><span className="text-gray-500 text-sm">Currency</span><p>{order.currency}</p></div>
                    <div><span className="text-gray-500 text-sm">Subtotal</span><p>{order.currency} {order.subtotal.toFixed(2)}</p></div>
                    <div><span className="text-gray-500 text-sm">Total</span><p className="font-semibold">{order.currency} {order.total.toFixed(2)}</p></div>
                    {order.notes && <div className="col-span-2"><span className="text-gray-500 text-sm">Notes</span><p>{order.notes}</p></div>}
                </div>

                <h2 className="font-semibold mb-2">Line Items</h2>
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr>
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-right">Qty</th>
                            <th className="px-4 py-2 text-right">Unit Price</th>
                            <th className="px-4 py-2 text-right">Line Total</th>
                            <th className="px-4 py-2 text-right">Shipped</th>
                        </tr></thead>
                        <tbody>
                            {(order.items ?? []).map(item => (
                                <tr key={item.id} className="border-t">
                                    <td className="px-4 py-2">{item.description}</td>
                                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                                    <td className="px-4 py-2 text-right">{item.unit_price.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right">{item.line_total.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right">{item.shipped_qty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

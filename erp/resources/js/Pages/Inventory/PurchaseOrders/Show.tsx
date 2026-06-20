import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { PurchaseOrder } from '@/types/inventory';

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800', sent: 'bg-blue-100 text-blue-800',
    partial: 'bg-yellow-100 text-yellow-800', received: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
};

interface Props { order: PurchaseOrder; }

export default function Show({ order }: Props) {
    const sendForm  = useForm({});
    const cancelForm = useForm({});
    const receiveForm = useForm<{ items: { id: number; received_qty: string }[] }>({
        items: (order.items ?? []).map(i => ({ id: i.id, received_qty: String(i.received_qty) })),
    });

    return (
        <AppLayout>
            <Head title={`PO ${order.po_number}`} />
            <div className="p-6 max-w-4xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{order.po_number}</h1>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                    </div>
                    <div className="flex gap-2">
                        {order.status === 'draft' && (
                            <Button onClick={() => sendForm.post(`/inventory/purchase-orders/${order.id}/send`)} disabled={sendForm.processing}>Send</Button>
                        )}
                        {['draft','sent'].includes(order.status) && (
                            <Button variant="outline" onClick={() => cancelForm.post(`/inventory/purchase-orders/${order.id}/cancel`)} disabled={cancelForm.processing}>Cancel</Button>
                        )}
                        <Link href="/inventory/purchase-orders"><Button variant="ghost">Back</Button></Link>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 bg-white rounded shadow p-4">
                    <div><span className="text-gray-500 text-sm">Supplier</span><p>{order.supplier?.name ?? '—'}</p></div>
                    <div><span className="text-gray-500 text-sm">Order Date</span><p>{order.order_date}</p></div>
                    <div><span className="text-gray-500 text-sm">Expected</span><p>{order.expected_date ?? '—'}</p></div>
                    <div><span className="text-gray-500 text-sm">Currency</span><p>{order.currency}</p></div>
                    <div><span className="text-gray-500 text-sm">Total</span><p className="font-semibold">{order.currency} {order.total.toFixed(2)}</p></div>
                    <div><span className="text-gray-500 text-sm">Receiving Progress</span><p>{order.receiving_progress}%</p></div>
                </div>

                <h2 className="font-semibold mb-2">Line Items</h2>
                <div className="bg-white rounded shadow overflow-hidden mb-6">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr>
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-right">Qty</th>
                            <th className="px-4 py-2 text-right">Unit Price</th>
                            <th className="px-4 py-2 text-right">Line Total</th>
                            <th className="px-4 py-2 text-right">Received</th>
                        </tr></thead>
                        <tbody>
                            {(order.items ?? []).map((item, idx) => (
                                <tr key={item.id} className="border-t">
                                    <td className="px-4 py-2">{item.description}</td>
                                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                                    <td className="px-4 py-2 text-right">{item.unit_price.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right">{item.line_total.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right">
                                        {['sent','partial'].includes(order.status) ? (
                                            <input type="number" step="0.01" min="0"
                                                value={receiveForm.data.items[idx]?.received_qty ?? '0'}
                                                onChange={e => {
                                                    const items = [...receiveForm.data.items];
                                                    items[idx] = { ...items[idx], received_qty: e.target.value };
                                                    receiveForm.setData('items', items);
                                                }}
                                                className="w-20 border rounded px-2 py-1 text-right" />
                                        ) : item.received_qty}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {['sent','partial'].includes(order.status) && (
                    <Button onClick={() => receiveForm.post(`/inventory/purchase-orders/${order.id}/receive`)} disabled={receiveForm.processing}>
                        Save Receiving
                    </Button>
                )}
            </div>
        </AppLayout>
    );
}

import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
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

interface Props {
    orders: { data: SalesOrder[]; links: unknown[] };
    filters: { status?: string; customer_id?: string };
}

export default function Index({ orders, filters }: Props) {
    return (
        <AppLayout>
            <Head title="Sales Orders" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Sales Orders</h1>
                    <Link href="/inventory/sales-orders/create">
                        <Button>New Sales Order</Button>
                    </Link>
                </div>
                <div className="flex gap-2 mb-4">
                    {['draft', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <button key={s}
                            onClick={() => router.get('/inventory/sales-orders', { ...filters, status: s === filters.status ? '' : s }, { preserveState: true })}
                            className={`px-3 py-1 rounded text-sm border ${filters.status === s ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">SO #</th>
                                <th className="px-4 py-2 text-left">Customer</th>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-right">Total</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.map(o => (
                                <tr key={o.id} className="border-t">
                                    <td className="px-4 py-2 font-mono">{o.so_number}</td>
                                    <td className="px-4 py-2">{(o as any).customer?.name ?? '—'}</td>
                                    <td className="px-4 py-2">{o.order_date}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-800'}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">{o.currency} {o.total.toFixed(2)}</td>
                                    <td className="px-4 py-2">
                                        <Link href={`/inventory/sales-orders/${o.id}`} className="text-blue-600 hover:underline text-xs">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

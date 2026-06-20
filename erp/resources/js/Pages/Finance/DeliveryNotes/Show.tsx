import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DeliveryNote } from '@/types/finance';

interface Props {
    deliveryNote: DeliveryNote;
}

const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    dispatched: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
};

export default function Show({ deliveryNote }: Props) {
    const handleDispatch = () => {
        router.post(`/finance/delivery-notes/${deliveryNote.id}/dispatch`);
    };

    const handleDeliver = () => {
        router.post(`/finance/delivery-notes/${deliveryNote.id}/deliver`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this delivery note?')) {
            router.delete(`/finance/delivery-notes/${deliveryNote.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title={`Delivery Note ${deliveryNote.reference}`} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/finance/delivery-notes" className="text-gray-500 hover:text-gray-700">
                        &larr; Delivery Notes
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {deliveryNote.reference}
                    </h1>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[deliveryNote.status] ?? ''}`}>
                        {deliveryNote.status}
                    </span>
                </div>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Details</h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Contact</dt>
                            <dd className="mt-1 text-sm text-gray-900">{deliveryNote.contact?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Sales Order</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {deliveryNote.salesOrder ? (
                                    <Link
                                        href={`/finance/sales-orders/${deliveryNote.sales_order_id}`}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        {deliveryNote.salesOrder.number ?? deliveryNote.salesOrder.reference}
                                    </Link>
                                ) : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Invoice</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {deliveryNote.invoice ? (
                                    <Link
                                        href={`/finance/invoices/${deliveryNote.invoice_id}`}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        {deliveryNote.invoice.reference}
                                    </Link>
                                ) : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Carrier</dt>
                            <dd className="mt-1 text-sm text-gray-900">{deliveryNote.carrier ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
                            <dd className="mt-1 text-sm text-gray-900">{deliveryNote.tracking_number ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Dispatch Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{deliveryNote.dispatch_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Delivery Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{deliveryNote.delivery_date ?? '—'}</dd>
                        </div>
                        {deliveryNote.notes && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{deliveryNote.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Items</h2>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                                <th className="pb-2">Product</th>
                                <th className="pb-2">Description</th>
                                <th className="pb-2 text-right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(deliveryNote.items ?? []).map((item) => (
                                <tr key={item.id}>
                                    <td className="py-2 text-sm text-gray-500">{item.product?.name ?? '—'}</td>
                                    <td className="py-2 text-sm text-gray-900">{item.description}</td>
                                    <td className="py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                        {deliveryNote.status === 'draft' && (
                            <button
                                onClick={handleDispatch}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                            >
                                Dispatch
                            </button>
                        )}
                        {deliveryNote.status === 'dispatched' && (
                            <button
                                onClick={handleDeliver}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                            >
                                Mark Delivered
                            </button>
                        )}
                    </div>
                    {deliveryNote.status === 'draft' && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

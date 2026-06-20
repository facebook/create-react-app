import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Vendor {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    currency: string;
}

interface PoLine {
    id: number;
    product_name: string;
    description: string | null;
    quantity: string;
    unit_price: string;
    uom: string;
    subtotal: string;
    received_qty: string;
}

interface Po {
    id: number;
    po_number: string;
    status: 'draft' | 'confirmed' | 'received' | 'cancelled';
    order_date: string;
    expected_delivery: string | null;
    notes: string | null;
    currency: string;
    total_amount: string;
    confirmed_at: string | null;
    received_at: string | null;
    vendor: Vendor | null;
    lines: PoLine[];
}

interface Props extends PageProps {
    po: Po;
}

const STATUS_COLORS: Record<string, string> = {
    draft:     'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    received:  'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function PoShow({ po }: Props) {
    function handleConfirm() {
        router.post(`/purchase/pos/${po.id}/confirm`);
    }

    function handleReceive() {
        router.post(`/purchase/pos/${po.id}/receive`);
    }

    return (
        <AppLayout>
            <Head title={`PO ${po.po_number}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/purchase/pos" className="text-sm text-slate-500 hover:text-slate-700">Purchase Orders</a>
                        <span className="text-slate-300">/</span>
                        <h1 className="text-2xl font-semibold text-slate-900">{po.po_number}</h1>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[po.status]}`}>
                            {po.status}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {po.status === 'draft' && (
                            <button
                                onClick={handleConfirm}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Confirm Order
                            </button>
                        )}
                        {po.status === 'confirmed' && (
                            <button
                                onClick={handleReceive}
                                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                            >
                                Mark Received
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <h2 className="mb-3 font-medium text-slate-900">PO Details</h2>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">PO Number</dt>
                                    <dd className="font-mono font-medium">{po.po_number}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Status</dt>
                                    <dd>
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[po.status]}`}>
                                            {po.status}
                                        </span>
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Order Date</dt>
                                    <dd>{po.order_date}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Currency</dt>
                                    <dd>{po.currency}</dd>
                                </div>
                                {po.expected_delivery && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Expected Delivery</dt>
                                        <dd>{po.expected_delivery}</dd>
                                    </div>
                                )}
                                {po.confirmed_at && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Confirmed At</dt>
                                        <dd>{po.confirmed_at}</dd>
                                    </div>
                                )}
                                {po.received_at && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Received At</dt>
                                        <dd>{po.received_at}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-slate-100 pt-2">
                                    <dt className="font-medium text-slate-700">Total Amount</dt>
                                    <dd className="font-bold text-slate-900">
                                        {parseFloat(po.total_amount).toFixed(2)} {po.currency}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {po.vendor && (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <h2 className="mb-3 font-medium text-slate-900">Vendor</h2>
                                <dl className="space-y-2 text-sm">
                                    <div>
                                        <dt className="text-slate-500 text-xs">Name</dt>
                                        <dd className="font-medium">{po.vendor.name}</dd>
                                    </div>
                                    {po.vendor.email && (
                                        <div>
                                            <dt className="text-slate-500 text-xs">Email</dt>
                                            <dd>{po.vendor.email}</dd>
                                        </div>
                                    )}
                                    {po.vendor.phone && (
                                        <div>
                                            <dt className="text-slate-500 text-xs">Phone</dt>
                                            <dd>{po.vendor.phone}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}

                        {po.notes && (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <h2 className="mb-2 font-medium text-slate-900">Notes</h2>
                                <p className="text-sm text-slate-600">{po.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-slate-100 px-4 py-3">
                                <h2 className="font-medium text-slate-900">Order Lines ({po.lines.length})</h2>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Product</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Qty</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Received</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Unit Price</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {po.lines.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No lines.</td>
                                        </tr>
                                    )}
                                    {po.lines.map((line) => (
                                        <tr key={line.id}>
                                            <td className="px-4 py-2.5">
                                                <div className="font-medium text-slate-800">{line.product_name}</div>
                                                {line.description && <div className="text-xs text-slate-500">{line.description}</div>}
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-slate-600">{line.quantity} {line.uom}</td>
                                            <td className="px-4 py-2.5 text-right text-slate-600">{line.received_qty}</td>
                                            <td className="px-4 py-2.5 text-right text-slate-600">{parseFloat(line.unit_price).toFixed(2)}</td>
                                            <td className="px-4 py-2.5 text-right font-medium text-slate-800">{parseFloat(line.subtotal).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-slate-200 bg-slate-50">
                                        <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-medium text-slate-700">Total</td>
                                        <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                                            {parseFloat(po.total_amount).toFixed(2)} {po.currency}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

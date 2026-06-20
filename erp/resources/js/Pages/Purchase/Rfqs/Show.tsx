import { useState } from 'react';
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

interface RfqLine {
    id: number;
    product_name: string;
    description: string | null;
    quantity: string;
    unit_price: string;
    uom: string;
    subtotal: string;
}

interface Rfq {
    id: number;
    rfq_number: string;
    status: 'draft' | 'sent' | 'received' | 'cancelled';
    expected_delivery: string | null;
    notes: string | null;
    currency: string;
    sent_at: string | null;
    vendor: Vendor | null;
    lines: RfqLine[];
}

interface Props extends PageProps {
    rfq: Rfq;
}

const STATUS_COLORS: Record<string, string> = {
    draft:     'bg-gray-100 text-gray-700',
    sent:      'bg-blue-100 text-blue-700',
    received:  'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function RfqShow({ rfq }: Props) {
    const [showLineForm, setShowLineForm] = useState(false);
    const [lineForm, setLineForm] = useState({
        product_name: '',
        description: '',
        quantity: '1',
        unit_price: '0',
        uom: 'unit',
    });

    function handleAddLine(e: React.FormEvent) {
        e.preventDefault();
        router.post(`/purchase/rfqs/${rfq.id}/lines`, lineForm, {
            onSuccess: () => {
                setShowLineForm(false);
                setLineForm({ product_name: '', description: '', quantity: '1', unit_price: '0', uom: 'unit' });
            },
        });
    }

    function handleSend() {
        router.post(`/purchase/rfqs/${rfq.id}/send`);
    }

    function handleConvert() {
        router.post(`/purchase/rfqs/${rfq.id}/convert`);
    }

    const total = rfq.lines.reduce((sum, line) => sum + parseFloat(line.subtotal), 0);

    return (
        <AppLayout>
            <Head title={`RFQ ${rfq.rfq_number}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/purchase/rfqs" className="text-sm text-slate-500 hover:text-slate-700">RFQs</a>
                        <span className="text-slate-300">/</span>
                        <h1 className="text-2xl font-semibold text-slate-900">{rfq.rfq_number}</h1>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[rfq.status]}`}>
                            {rfq.status}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {rfq.status === 'draft' && (
                            <button
                                onClick={handleSend}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Send to Vendor
                            </button>
                        )}
                        {(rfq.status === 'sent' || rfq.status === 'received') && (
                            <button
                                onClick={handleConvert}
                                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                            >
                                Convert to PO
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <h2 className="mb-3 font-medium text-slate-900">RFQ Details</h2>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">RFQ Number</dt>
                                    <dd className="font-mono font-medium">{rfq.rfq_number}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Status</dt>
                                    <dd>
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[rfq.status]}`}>
                                            {rfq.status}
                                        </span>
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Currency</dt>
                                    <dd>{rfq.currency}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Expected Delivery</dt>
                                    <dd>{rfq.expected_delivery ?? '—'}</dd>
                                </div>
                                {rfq.sent_at && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Sent At</dt>
                                        <dd>{rfq.sent_at}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {rfq.vendor && (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <h2 className="mb-3 font-medium text-slate-900">Vendor</h2>
                                <dl className="space-y-2 text-sm">
                                    <div>
                                        <dt className="text-slate-500 text-xs">Name</dt>
                                        <dd className="font-medium">{rfq.vendor.name}</dd>
                                    </div>
                                    {rfq.vendor.email && (
                                        <div>
                                            <dt className="text-slate-500 text-xs">Email</dt>
                                            <dd>{rfq.vendor.email}</dd>
                                        </div>
                                    )}
                                    {rfq.vendor.phone && (
                                        <div>
                                            <dt className="text-slate-500 text-xs">Phone</dt>
                                            <dd>{rfq.vendor.phone}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}

                        {rfq.notes && (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <h2 className="mb-2 font-medium text-slate-900">Notes</h2>
                                <p className="text-sm text-slate-600">{rfq.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                <h2 className="font-medium text-slate-900">Lines ({rfq.lines.length})</h2>
                                {rfq.status === 'draft' && (
                                    <button
                                        onClick={() => setShowLineForm(!showLineForm)}
                                        className="rounded text-xs bg-indigo-50 px-2 py-1 text-indigo-700 hover:bg-indigo-100"
                                    >
                                        Add Line
                                    </button>
                                )}
                            </div>

                            {showLineForm && (
                                <div className="border-b border-slate-100 bg-slate-50 p-4">
                                    <form onSubmit={handleAddLine} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        <div className="col-span-2 sm:col-span-3">
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Product Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={lineForm.product_name}
                                                onChange={(e) => setLineForm({ ...lineForm, product_name: e.target.value })}
                                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Quantity *</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                min="0.001"
                                                required
                                                value={lineForm.quantity}
                                                onChange={(e) => setLineForm({ ...lineForm, quantity: e.target.value })}
                                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Unit Price *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                required
                                                value={lineForm.unit_price}
                                                onChange={(e) => setLineForm({ ...lineForm, unit_price: e.target.value })}
                                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">UOM</label>
                                            <input
                                                type="text"
                                                value={lineForm.uom}
                                                onChange={(e) => setLineForm({ ...lineForm, uom: e.target.value })}
                                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-3 flex gap-2">
                                            <button type="submit" className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                                                Add
                                            </button>
                                            <button type="button" onClick={() => setShowLineForm(false)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Product</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Qty</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">UOM</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Unit Price</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rfq.lines.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No lines yet. Add items above.</td>
                                        </tr>
                                    )}
                                    {rfq.lines.map((line) => (
                                        <tr key={line.id}>
                                            <td className="px-4 py-2.5">
                                                <div className="font-medium text-slate-800">{line.product_name}</div>
                                                {line.description && <div className="text-xs text-slate-500">{line.description}</div>}
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-slate-600">{line.quantity}</td>
                                            <td className="px-4 py-2.5 text-right text-slate-500">{line.uom}</td>
                                            <td className="px-4 py-2.5 text-right text-slate-600">{parseFloat(line.unit_price).toFixed(2)}</td>
                                            <td className="px-4 py-2.5 text-right font-medium text-slate-800">{parseFloat(line.subtotal).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {rfq.lines.length > 0 && (
                                    <tfoot>
                                        <tr className="border-t border-slate-200 bg-slate-50">
                                            <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-medium text-slate-700">Total</td>
                                            <td className="px-4 py-2.5 text-right font-bold text-slate-900">{total.toFixed(2)} {rfq.currency}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

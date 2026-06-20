import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Vendor {
    id: number;
    name: string;
}

interface Rfq {
    id: number;
    rfq_number: string;
    status: 'draft' | 'sent' | 'received' | 'cancelled';
    expected_delivery: string | null;
    currency: string;
    vendor: Vendor | null;
    created_at: string;
}

interface Paginator<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    total: number;
}

interface Props extends PageProps {
    rfqs: Paginator<Rfq>;
    vendors: Vendor[];
}

const STATUS_COLORS: Record<string, string> = {
    draft:     'bg-gray-100 text-gray-700',
    sent:      'bg-blue-100 text-blue-700',
    received:  'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function RfqsIndex({ rfqs, vendors }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        po_vendor_id: '',
        expected_delivery: '',
        notes: '',
        currency: 'USD',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post('/purchase/rfqs', form, {
            onSuccess: () => {
                setShowForm(false);
                setForm({ po_vendor_id: '', expected_delivery: '', notes: '', currency: 'USD' });
            },
        });
    }

    function handleSend(rfqId: number) {
        router.post(`/purchase/rfqs/${rfqId}/send`, {}, { preserveScroll: true });
    }

    function handleConvert(rfqId: number) {
        router.post(`/purchase/rfqs/${rfqId}/convert`, {}, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="RFQs" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Request for Quotations</h1>
                        <p className="text-sm text-slate-500 mt-1">{rfqs.total} RFQs</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        New RFQ
                    </button>
                </div>

                {showForm && (
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                        <h2 className="mb-3 font-medium text-slate-900">Create RFQ</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Vendor *</label>
                                <select
                                    required
                                    value={form.po_vendor_id}
                                    onChange={(e) => setForm({ ...form, po_vendor_id: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="">Select vendor…</option>
                                    {vendors.map((v) => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Expected Delivery</label>
                                <input
                                    type="date"
                                    value={form.expected_delivery}
                                    onChange={(e) => setForm({ ...form, expected_delivery: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
                                <input
                                    type="text"
                                    value={form.currency}
                                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <button type="submit" className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                                    Create
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">RFQ #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Vendor</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Expected Delivery</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Currency</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rfqs.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No RFQs found.</td>
                                </tr>
                            )}
                            {rfqs.data.map((rfq) => (
                                <tr key={rfq.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono font-medium text-indigo-600">
                                        <Link href={`/purchase/rfqs/${rfq.id}`} className="hover:underline">
                                            {rfq.rfq_number}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{rfq.vendor?.name ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[rfq.status]}`}>
                                            {rfq.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{rfq.expected_delivery ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-600">{rfq.currency}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {rfq.status === 'draft' && (
                                                <button
                                                    onClick={() => handleSend(rfq.id)}
                                                    className="rounded text-xs bg-blue-50 px-2 py-1 text-blue-700 hover:bg-blue-100"
                                                >
                                                    Send
                                                </button>
                                            )}
                                            {(rfq.status === 'sent' || rfq.status === 'received') && (
                                                <button
                                                    onClick={() => handleConvert(rfq.id)}
                                                    className="rounded text-xs bg-green-50 px-2 py-1 text-green-700 hover:bg-green-100"
                                                >
                                                    Convert to PO
                                                </button>
                                            )}
                                            <Link
                                                href={`/purchase/rfqs/${rfq.id}`}
                                                className="rounded text-xs bg-slate-50 px-2 py-1 text-slate-700 hover:bg-slate-100"
                                            >
                                                View
                                            </Link>
                                        </div>
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

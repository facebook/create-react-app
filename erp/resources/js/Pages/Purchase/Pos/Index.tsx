import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Vendor {
    id: number;
    name: string;
}

interface Po {
    id: number;
    po_number: string;
    status: 'draft' | 'confirmed' | 'received' | 'cancelled';
    order_date: string;
    expected_delivery: string | null;
    total_amount: string;
    currency: string;
    vendor: Vendor | null;
}

interface Paginator<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    total: number;
}

interface Props extends PageProps {
    pos: Paginator<Po>;
}

const STATUS_COLORS: Record<string, string> = {
    draft:     'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    received:  'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function PosIndex({ pos }: Props) {
    function handleConfirm(poId: number) {
        router.post(`/purchase/pos/${poId}/confirm`, {}, { preserveScroll: true });
    }

    function handleReceive(poId: number) {
        router.post(`/purchase/pos/${poId}/receive`, {}, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="Purchase Orders" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Purchase Orders</h1>
                        <p className="text-sm text-slate-500 mt-1">{pos.total} purchase orders</p>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">PO #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Vendor</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Order Date</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Total</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pos.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No purchase orders found.</td>
                                </tr>
                            )}
                            {pos.data.map((po) => (
                                <tr key={po.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono font-medium text-indigo-600">
                                        <Link href={`/purchase/pos/${po.id}`} className="hover:underline">
                                            {po.po_number}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{po.vendor?.name ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[po.status]}`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{po.order_date}</td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                                        {parseFloat(po.total_amount).toFixed(2)} {po.currency}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {po.status === 'draft' && (
                                                <button
                                                    onClick={() => handleConfirm(po.id)}
                                                    className="rounded text-xs bg-blue-50 px-2 py-1 text-blue-700 hover:bg-blue-100"
                                                >
                                                    Confirm
                                                </button>
                                            )}
                                            {po.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleReceive(po.id)}
                                                    className="rounded text-xs bg-green-50 px-2 py-1 text-green-700 hover:bg-green-100"
                                                >
                                                    Receive
                                                </button>
                                            )}
                                            <Link
                                                href={`/purchase/pos/${po.id}`}
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

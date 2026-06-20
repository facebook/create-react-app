import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface RmaItem {
    id: number;
    description: string | null;
    quantity_requested: number;
    quantity_received: number;
    condition: string;
}

interface RmaRequest {
    id: number;
    rma_number: string | null;
    type: string;
    status: string;
    contact_name: string | null;
    reason: string;
    disposition: string;
    requested_date: string | null;
    received_date: string | null;
    inspected_date: string | null;
    notes: string | null;
    items: RmaItem[];
}

interface Props extends PageProps {
    rmaRequest: RmaRequest;
}

const STATUS_COLORS: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    approved:  'bg-blue-100 text-blue-700',
    received:  'bg-indigo-100 text-indigo-700',
    inspected: 'bg-purple-100 text-purple-700',
    closed:    'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
};

export default function RmaRequestShow({ rmaRequest }: Props) {
    const id = rmaRequest.id;

    return (
        <AppLayout>
            <Head title={rmaRequest.rma_number ?? `RMA #${id}`} />
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">
                                {rmaRequest.rma_number ?? `RMA #${id}`}
                            </h1>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[rmaRequest.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                {rmaRequest.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 capitalize">{rmaRequest.type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex gap-2">
                        {rmaRequest.status === 'pending' && (
                            <Button onClick={() => router.post(`/inventory/rma-requests/${id}/approve`)}>
                                Approve
                            </Button>
                        )}
                        {rmaRequest.status === 'approved' && (
                            <Button onClick={() => router.post(`/inventory/rma-requests/${id}/receive`)}>
                                Receive
                            </Button>
                        )}
                        {rmaRequest.status === 'received' && (
                            <Button onClick={() => router.post(`/inventory/rma-requests/${id}/inspect`)}>
                                Inspect
                            </Button>
                        )}
                        {rmaRequest.status === 'inspected' && (
                            <Button onClick={() => router.post(`/inventory/rma-requests/${id}/close`)}>
                                Close
                            </Button>
                        )}
                        <Link href="/inventory/rma-requests">
                            <Button variant="secondary">Back</Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">RMA Details</h2>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Disposition</dt>
                            <dd className="mt-0.5 text-slate-700 capitalize">{rmaRequest.disposition}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Contact</dt>
                            <dd className="mt-0.5 text-slate-700">{rmaRequest.contact_name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Requested Date</dt>
                            <dd className="mt-0.5 text-slate-700">{rmaRequest.requested_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Received Date</dt>
                            <dd className="mt-0.5 text-slate-700">{rmaRequest.received_date ?? '—'}</dd>
                        </div>
                    </dl>
                    <div className="mt-4 border-t border-slate-100 pt-3">
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Reason</dt>
                        <dd className="text-sm text-slate-600">{rmaRequest.reason}</dd>
                    </div>
                </div>

                {rmaRequest.items.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100">
                            <h2 className="text-sm font-semibold text-slate-700">Items ({rmaRequest.items.length})</h2>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Item</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Qty Req.</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Qty Recv.</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Condition</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {rmaRequest.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm text-slate-700">{item.description ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">{item.quantity_requested}</td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">{item.quantity_received}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 capitalize">{item.condition}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

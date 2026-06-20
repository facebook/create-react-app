import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface RmaRequest {
    id: number;
    rma_number: string | null;
    type: string;
    status: string;
    contact_name: string | null;
    reason: string;
    disposition: string;
}

interface Props extends PageProps {
    rmaRequests: { data: RmaRequest[]; current_page: number; last_page: number };
}

const STATUS_COLORS: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    approved:  'bg-blue-100 text-blue-700',
    received:  'bg-indigo-100 text-indigo-700',
    inspected: 'bg-purple-100 text-purple-700',
    closed:    'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
};

export default function RmaRequestsIndex({ rmaRequests }: Props) {
    return (
        <AppLayout>
            <Head title="RMA Requests" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">RMA Requests</h1>
                        <p className="text-sm text-slate-500 mt-1">{rmaRequests.data.length} requests</p>
                    </div>
                    <Link href="/inventory/rma-requests/create">
                        <Button>New RMA</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">RMA #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Contact</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Disposition</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {rmaRequests.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No RMA requests found.
                                    </td>
                                </tr>
                            )}
                            {rmaRequests.data.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/inventory/rma-requests/${r.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                            {r.rma_number ?? `#${r.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{r.type.replace('_', ' ')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{r.contact_name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{r.disposition}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-3">
                                            {r.status === 'pending' && (
                                                <button
                                                    onClick={() => router.post(`/inventory/rma-requests/${r.id}/approve`)}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {r.status === 'approved' && (
                                                <button
                                                    onClick={() => router.post(`/inventory/rma-requests/${r.id}/receive`)}
                                                    className="text-sm text-green-600 hover:text-green-800"
                                                >
                                                    Receive
                                                </button>
                                            )}
                                            <Link href={`/inventory/rma-requests/${r.id}/edit`} className="text-sm text-slate-500 hover:text-slate-700">
                                                Edit
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

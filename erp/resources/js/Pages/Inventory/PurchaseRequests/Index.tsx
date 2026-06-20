import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface PurchaseRequest {
    id: number;
    request_number: string | null;
    title: string;
    status: string;
    priority: string;
    estimated_cost: string;
    required_by: string | null;
    created_at: string;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props extends PageProps {
    purchaseRequests: Paginator<PurchaseRequest>;
}

export default function PurchaseRequestsIndex({ purchaseRequests }: Props) {
    return (
        <AppLayout>
            <Head title="Purchase Requests" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Purchase Requests</h1>
                    <Link
                        href="/inventory/purchase-requests/create"
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        New Request
                    </Link>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Est. Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {purchaseRequests.data.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-600">{req.request_number ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        <Link href={`/inventory/purchase-requests/${req.id}`} className="hover:underline">
                                            {req.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{req.status}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{req.priority}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{req.estimated_cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

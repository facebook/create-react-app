import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface PurchaseRequest {
    id: number;
    request_number: string | null;
    title: string;
    description: string | null;
    department: string | null;
    status: string;
    priority: string;
    estimated_cost: string;
    currency: string;
    required_by: string | null;
    justification: string | null;
    submitted_at: string | null;
    approved_at: string | null;
    created_at: string;
}

interface Props extends PageProps {
    purchaseRequest: PurchaseRequest;
}

export default function PurchaseRequestsShow({ purchaseRequest }: Props) {
    return (
        <AppLayout>
            <Head title={`Purchase Request — ${purchaseRequest.title}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">{purchaseRequest.request_number ?? 'Draft'}</p>
                        <h1 className="text-2xl font-semibold text-slate-900">{purchaseRequest.title}</h1>
                    </div>
                    <Link
                        href="/inventory/purchase-requests"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Back to list
                    </Link>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Status</dt>
                            <dd className="mt-1 text-sm capitalize text-slate-900">{purchaseRequest.status}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Priority</dt>
                            <dd className="mt-1 text-sm capitalize text-slate-900">{purchaseRequest.priority}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Estimated Cost</dt>
                            <dd className="mt-1 text-sm text-slate-900">{purchaseRequest.currency} {purchaseRequest.estimated_cost}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Required By</dt>
                            <dd className="mt-1 text-sm text-slate-900">{purchaseRequest.required_by ?? '—'}</dd>
                        </div>
                        {purchaseRequest.description && (
                            <div className="col-span-2">
                                <dt className="text-xs font-medium uppercase text-slate-500">Description</dt>
                                <dd className="mt-1 text-sm text-slate-900">{purchaseRequest.description}</dd>
                            </div>
                        )}
                        {purchaseRequest.justification && (
                            <div className="col-span-2">
                                <dt className="text-xs font-medium uppercase text-slate-500">Justification</dt>
                                <dd className="mt-1 text-sm text-slate-900">{purchaseRequest.justification}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}

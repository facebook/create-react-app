import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ProductWarranty {
    id: number;
    name: string;
    duration_months: number;
    product: { id: number; name: string; sku: string } | null;
}

interface WarrantyClaim {
    id: number;
    claim_number: string | null;
    status: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    purchase_date: string | null;
    claim_date: string;
    warranty_expiry: string | null;
    issue_description: string;
    resolution_type: string | null;
    resolution_notes: string | null;
    resolved_date: string | null;
    warranty: ProductWarranty | null;
}

interface Props extends PageProps {
    warrantyClaim: WarrantyClaim;
}

const STATUS_COLORS: Record<string, string> = {
    open:         'bg-yellow-100 text-yellow-800',
    under_review: 'bg-slate-100 text-slate-700',
    approved:     'bg-blue-100 text-blue-700',
    rejected:     'bg-red-100 text-red-700',
    resolved:     'bg-green-100 text-green-700',
};

export default function WarrantyClaimShow({ warrantyClaim }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        resolution_type:  '',
        resolution_notes: '',
    });

    function handleResolve(e: React.FormEvent) {
        e.preventDefault();
        post(`/inventory/warranty-claims/${warrantyClaim.id}/resolve`);
    }

    return (
        <AppLayout>
            <Head title={`Claim: ${warrantyClaim.claim_number ?? `#${warrantyClaim.id}`}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Claim {warrantyClaim.claim_number ?? `#${warrantyClaim.id}`}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {warrantyClaim.warranty?.product?.name ?? '—'} — {warrantyClaim.warranty?.name ?? '—'}
                        </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[warrantyClaim.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {warrantyClaim.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-medium text-slate-500 mb-3">Customer Information</h2>
                        <dl className="space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Name</dt>
                                <dd className="text-sm font-medium text-slate-900">{warrantyClaim.customer_name}</dd>
                            </div>
                            {warrantyClaim.customer_email && (
                                <div className="flex justify-between">
                                    <dt className="text-sm text-slate-500">Email</dt>
                                    <dd className="text-sm text-slate-700">{warrantyClaim.customer_email}</dd>
                                </div>
                            )}
                            {warrantyClaim.customer_phone && (
                                <div className="flex justify-between">
                                    <dt className="text-sm text-slate-500">Phone</dt>
                                    <dd className="text-sm text-slate-700">{warrantyClaim.customer_phone}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-medium text-slate-500 mb-3">Claim Dates</h2>
                        <dl className="space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Claim Date</dt>
                                <dd className="text-sm font-medium text-slate-900">{warrantyClaim.claim_date}</dd>
                            </div>
                            {warrantyClaim.purchase_date && (
                                <div className="flex justify-between">
                                    <dt className="text-sm text-slate-500">Purchase Date</dt>
                                    <dd className="text-sm text-slate-700">{warrantyClaim.purchase_date}</dd>
                                </div>
                            )}
                            {warrantyClaim.warranty_expiry && (
                                <div className="flex justify-between">
                                    <dt className="text-sm text-slate-500">Warranty Expiry</dt>
                                    <dd className="text-sm text-slate-700">{warrantyClaim.warranty_expiry}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-medium text-slate-500 mb-3">Issue Description</h2>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{warrantyClaim.issue_description}</p>
                </div>

                {warrantyClaim.status === 'approved' && (
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-base font-medium text-slate-900 mb-4">Resolve Claim</h2>
                        <form onSubmit={handleResolve} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Resolution Type *</label>
                                <select
                                    value={data.resolution_type}
                                    onChange={(e) => setData('resolution_type', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm max-w-xs"
                                >
                                    <option value="">Select resolution</option>
                                    <option value="repair">Repair</option>
                                    <option value="replace">Replace</option>
                                    <option value="refund">Refund</option>
                                    <option value="reject">Reject</option>
                                </select>
                                {errors.resolution_type && <p className="text-red-600 text-sm mt-1">{errors.resolution_type}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Resolution Notes</label>
                                <textarea
                                    value={data.resolution_notes}
                                    onChange={(e) => setData('resolution_notes', e.target.value)}
                                    rows={3}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>Mark as Resolved</Button>
                        </form>
                    </div>
                )}

                {warrantyClaim.resolution_type && (
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-medium text-slate-500 mb-3">Resolution</h2>
                        <dl className="space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Type</dt>
                                <dd className="text-sm font-medium text-slate-900 capitalize">{warrantyClaim.resolution_type}</dd>
                            </div>
                            {warrantyClaim.resolved_date && (
                                <div className="flex justify-between">
                                    <dt className="text-sm text-slate-500">Resolved Date</dt>
                                    <dd className="text-sm text-slate-700">{warrantyClaim.resolved_date}</dd>
                                </div>
                            )}
                            {warrantyClaim.resolution_notes && (
                                <div>
                                    <dt className="text-sm text-slate-500 mb-1">Notes</dt>
                                    <dd className="text-sm text-slate-700 whitespace-pre-wrap">{warrantyClaim.resolution_notes}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                )}

                <div>
                    <Link href="/inventory/warranty-claims" className="text-sm text-slate-500 hover:text-slate-700">
                        &larr; Back to Warranty Claims
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ProductWarranty {
    id: number;
    name: string;
    product: { id: number; name: string } | null;
}

interface WarrantyClaim {
    id: number;
    claim_number: string | null;
    customer_name: string;
    status: string;
    claim_date: string;
    warranty: ProductWarranty | null;
}

interface Props extends PageProps {
    warrantyClaims: { data: WarrantyClaim[]; current_page: number; last_page: number };
}

const STATUS_COLORS: Record<string, string> = {
    open:         'bg-yellow-100 text-yellow-800',
    under_review: 'bg-slate-100 text-slate-700',
    approved:     'bg-blue-100 text-blue-700',
    rejected:     'bg-red-100 text-red-700',
    resolved:     'bg-green-100 text-green-700',
};

export default function WarrantyClaimsIndex({ warrantyClaims }: Props) {
    return (
        <AppLayout>
            <Head title="Warranty Claims" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Warranty Claims</h1>
                        <p className="text-sm text-slate-500 mt-1">{warrantyClaims.data.length} claims</p>
                    </div>
                    <Link href="/inventory/warranty-claims/create">
                        <Button>New Claim</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Claim #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Product / Warranty</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Claim Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {warrantyClaims.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No warranty claims found.
                                    </td>
                                </tr>
                            )}
                            {warrantyClaims.data.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/inventory/warranty-claims/${c.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                            {c.claim_number ?? `#${c.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.customer_name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {c.warranty ? (
                                            <>
                                                <div>{c.warranty.product?.name ?? '—'}</div>
                                                <div className="text-xs text-slate-400">{c.warranty.name}</div>
                                            </>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.claim_date}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {c.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {c.status === 'open' && (
                                                <>
                                                    <button
                                                        onClick={() => router.post(`/inventory/warranty-claims/${c.id}/approve`)}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => router.post(`/inventory/warranty-claims/${c.id}/reject`)}
                                                        className="text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <Link href={`/inventory/warranty-claims/${c.id}`} className="text-sm text-slate-500 hover:text-slate-700">
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

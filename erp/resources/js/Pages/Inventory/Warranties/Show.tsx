import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface WarrantyClaim {
    id: number;
    claim_number: string | null;
    customer_name: string;
    status: string;
    claim_date: string;
}

interface ProductWarranty {
    id: number;
    name: string;
    duration_months: number;
    warranty_type: string;
    is_default: boolean;
    terms: string | null;
    product: Product | null;
    claims: WarrantyClaim[];
    created_at: string;
}

interface Props extends PageProps {
    warranty: ProductWarranty;
}

const STATUS_COLORS: Record<string, string> = {
    open:         'bg-yellow-100 text-yellow-800',
    under_review: 'bg-slate-100 text-slate-700',
    approved:     'bg-blue-100 text-blue-700',
    rejected:     'bg-red-100 text-red-700',
    resolved:     'bg-green-100 text-green-700',
};

export default function WarrantyShow({ warranty }: Props) {
    return (
        <AppLayout>
            <Head title={`Warranty: ${warranty.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{warranty.name}</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {warranty.product ? `${warranty.product.name} (${warranty.product.sku})` : '—'}
                        </p>
                    </div>
                    <Link href={`/inventory/warranties/${warranty.id}/edit`}>
                        <Button variant="secondary">Edit</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-medium text-slate-500 mb-3">Details</h2>
                        <dl className="space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Duration</dt>
                                <dd className="text-sm font-medium text-slate-900">{warranty.duration_months} months</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Type</dt>
                                <dd className="text-sm font-medium text-slate-900 capitalize">{warranty.warranty_type}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Default</dt>
                                <dd className="text-sm font-medium text-slate-900">{warranty.is_default ? 'Yes' : 'No'}</dd>
                            </div>
                        </dl>
                    </div>

                    {warranty.terms && (
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-sm font-medium text-slate-500 mb-3">Terms & Conditions</h2>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{warranty.terms}</p>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                        <h2 className="text-base font-medium text-slate-900">Warranty Claims</h2>
                        <Link href={`/inventory/warranty-claims/create?warranty_id=${warranty.id}`}>
                            <Button size="sm">New Claim</Button>
                        </Link>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Claim #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Claim Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {warranty.claims.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No claims yet.
                                    </td>
                                </tr>
                            )}
                            {warranty.claims.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/inventory/warranty-claims/${c.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                            {c.claim_number ?? `#${c.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.customer_name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.claim_date}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {c.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/inventory/warranty-claims/${c.id}`} className="text-sm text-slate-500 hover:text-slate-700">
                                            View
                                        </Link>
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

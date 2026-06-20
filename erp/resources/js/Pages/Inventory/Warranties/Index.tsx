import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface ProductWarranty {
    id: number;
    name: string;
    duration_months: number;
    warranty_type: string;
    is_default: boolean;
    product: Product | null;
    claims_count?: number;
}

interface Props extends PageProps {
    warranties: { data: ProductWarranty[]; current_page: number; last_page: number };
}

const TYPE_COLORS: Record<string, string> = {
    standard: 'bg-slate-100 text-slate-700',
    extended: 'bg-blue-100 text-blue-700',
    limited:  'bg-yellow-100 text-yellow-800',
};

export default function WarrantiesIndex({ warranties }: Props) {
    return (
        <AppLayout>
            <Head title="Product Warranties" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Product Warranties</h1>
                        <p className="text-sm text-slate-500 mt-1">{warranties.data.length} warranties</p>
                    </div>
                    <Link href="/inventory/warranties/create">
                        <Button>New Warranty</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Duration</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Default</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Claims</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {warranties.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No warranties found.
                                    </td>
                                </tr>
                            )}
                            {warranties.data.map((w) => (
                                <tr key={w.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/inventory/warranties/${w.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                            {w.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {w.product ? `${w.product.name} (${w.product.sku})` : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{w.duration_months} months</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_COLORS[w.warranty_type] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {w.warranty_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{w.is_default ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        <Link href={`/inventory/warranty-claims?warranty_id=${w.id}`} className="text-indigo-600 hover:text-indigo-800">
                                            {w.claims_count ?? 0}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/inventory/warranties/${w.id}/edit`} className="text-sm text-slate-500 hover:text-slate-700">
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this warranty?')) {
                                                        router.delete(`/inventory/warranties/${w.id}`);
                                                    }
                                                }}
                                                className="text-sm text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
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

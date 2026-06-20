import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import type { Product, ProductSubstitute } from '@/types/inventory';

interface Props extends PageProps {
    product: Product;
    substitutes: ProductSubstitute[];
}

export default function ProductSubstitutesIndex({ product, substitutes }: Props) {
    return (
        <AppLayout>
            <Head title={`Substitutes for ${product.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Product Substitutes</h1>
                        <p className="text-sm text-slate-500 mt-1">{product.name} &mdash; {substitutes.length} substitute(s)</p>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Substitute Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bidirectional</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Active</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {substitutes.map((sub) => (
                                <tr key={sub.id}>
                                    <td className="px-4 py-3 text-sm text-slate-900">
                                        {sub.substitute_product?.name ?? sub.substitute_product_id}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{sub.priority}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{sub.is_bidirectional ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{sub.is_active ? 'Active' : 'Inactive'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{sub.notes ?? '-'}</td>
                                </tr>
                            ))}
                            {substitutes.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No substitutes configured for this product.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

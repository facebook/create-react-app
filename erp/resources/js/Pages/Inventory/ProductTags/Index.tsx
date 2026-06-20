import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ProductTag, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    tags: Paginator<ProductTag>;
}

export default function ProductTagsIndex({ tags }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Product Tags" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Product Tags</h1>
                        <p className="text-sm text-slate-500 mt-1">{tags.total} tags</p>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Color</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Products</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {tags.data.map((tag) => (
                                <tr key={tag.id}>
                                    <td className="px-4 py-3 text-sm text-slate-900">
                                        <span
                                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                                        >
                                            {tag.name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">
                                        <span className="font-mono">{tag.color}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{tag.description ?? '-'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{tag.product_count}</td>
                                </tr>
                            ))}
                            {tags.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No product tags found.
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

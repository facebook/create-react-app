import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ProductAttribute } from '@/types/inventory';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    attributes: Paginator<ProductAttribute>;
}

export default function ProductAttributesIndex({ attributes }: Props) {
    const { can } = usePermission();
    const { data, setData, post, processing, reset } = useForm({
        name: '', type: 'select' as ProductAttribute['type'], options: '' as string,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/product-attributes', {
            onSuccess: () => reset(),
        });
    }

    function destroy(id: number) {
        if (!confirm('Delete this attribute?')) return;
        // @ts-ignore
        window.axios.delete(`/inventory/product-attributes/${id}`).then(() => location.reload());
    }

    return (
        <AppLayout>
            <Head title="Product Attributes" />
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-semibold text-slate-800">Product Attributes</h1>

                {can('inventory.create') && (
                    <form onSubmit={submit} className="flex items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Color"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value as ProductAttribute['type'])}
                                className="rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="text">Text</option>
                                <option value="select">Select</option>
                                <option value="color">Color</option>
                                <option value="number">Number</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Options (comma-separated)</label>
                            <input
                                value={data.options}
                                onChange={(e) => setData('options', e.target.value)}
                                className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="S,M,L,XL"
                            />
                        </div>
                        <Button type="submit" disabled={processing}>Add Attribute</Button>
                    </form>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Options</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {attributes.data.map((attr) => (
                                <tr key={attr.id} className="border-b border-slate-100 last:border-0">
                                    <td className="px-4 py-3 font-medium">{attr.name}</td>
                                    <td className="px-4 py-3 capitalize">{attr.type}</td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {attr.options ? attr.options.join(', ') : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {can('inventory.delete') && (
                                            <button
                                                onClick={() => destroy(attr.id)}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {attributes.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-500">No attributes yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ProductCategory } from '@/types/inventory';

interface Props extends PageProps {
    categories: ProductCategory[];
}

export default function ProductCategoriesIndex({ categories }: Props) {
    const { can } = usePermission();
    const [editingId, setEditingId] = useState<number | null>(null);

    const createForm = useForm({
        name: '',
        description: '',
        colour: '#6366f1',
    });

    const editForm = useForm({
        name: '',
        description: '',
        colour: '#6366f1',
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/inventory/product-categories', {
            onSuccess: () => createForm.reset(),
        });
    }

    function startEdit(cat: ProductCategory) {
        setEditingId(cat.id);
        editForm.setData({
            name: cat.name,
            description: cat.description ?? '',
            colour: cat.colour,
        });
    }

    function handleUpdate(e: React.FormEvent, id: number) {
        e.preventDefault();
        editForm.patch(`/inventory/product-categories/${id}`, {
            onSuccess: () => setEditingId(null),
        });
    }

    function handleDelete(id: number, name: string) {
        if (!confirm(`Delete category "${name}"? Products will become uncategorised.`)) return;
        router.delete(`/inventory/product-categories/${id}`);
    }

    return (
        <AppLayout>
            <Head title="Product Categories" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Product Categories</h1>
                        <p className="text-sm text-slate-500 mt-1">{categories.length} categories</p>
                    </div>
                </div>

                {can('inventory.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-medium text-slate-700 mb-3">Add Category</h2>
                        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
                            <div className="flex-1 min-w-40">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Category name"
                                    required
                                />
                                {createForm.errors.name && (
                                    <p className="text-xs text-red-600 mt-1">{createForm.errors.name}</p>
                                )}
                            </div>
                            <div className="flex-1 min-w-40">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Optional description"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Colour</label>
                                <input
                                    type="color"
                                    value={createForm.data.colour}
                                    onChange={(e) => createForm.setData('colour', e.target.value)}
                                    className="h-9 w-16 cursor-pointer rounded border border-slate-300 p-0.5"
                                />
                            </div>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Saving…' : 'Add Category'}
                            </Button>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Colour</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Products</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-slate-50">
                                    {editingId === cat.id ? (
                                        <td colSpan={5} className="px-4 py-3">
                                            <form onSubmit={(e) => handleUpdate(e, cat.id)} className="flex flex-wrap gap-3 items-end">
                                                <div className="flex-1 min-w-40">
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.data.name}
                                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        required
                                                    />
                                                    {editForm.errors.name && (
                                                        <p className="text-xs text-red-600 mt-1">{editForm.errors.name}</p>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-40">
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.data.description}
                                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Colour</label>
                                                    <input
                                                        type="color"
                                                        value={editForm.data.colour}
                                                        onChange={(e) => editForm.setData('colour', e.target.value)}
                                                        className="h-9 w-16 cursor-pointer rounded border border-slate-300 p-0.5"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button type="submit" size="sm" disabled={editForm.processing}>
                                                        Save
                                                    </Button>
                                                    <Button type="button" variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </form>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3">
                                                <div
                                                    className="h-6 w-6 rounded"
                                                    style={{ backgroundColor: cat.colour }}
                                                    title={cat.colour}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{cat.name}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500">{cat.description ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500">{cat.products_count ?? 0}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-3">
                                                    {can('inventory.create') && (
                                                        <button
                                                            onClick={() => startEdit(cat)}
                                                            className="text-sm text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {can('inventory.delete') && (
                                                        <button
                                                            onClick={() => handleDelete(cat.id, cat.name)}
                                                            className="text-sm text-red-600 hover:text-red-800"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

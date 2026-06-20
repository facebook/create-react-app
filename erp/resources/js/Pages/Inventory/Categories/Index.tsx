import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Category } from '@/types/inventory';

interface Props extends PageProps {
    categories: Category[];
}

type EditMode = { type: 'edit'; id: number } | { type: 'add-child'; parentId: number } | null;

function inputCls() {
    return 'w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
}

interface InlineFormData {
    name: string;
    description: string;
    parent_id: number | null;
}

interface InlineFormProps {
    form: ReturnType<typeof useForm<InlineFormData>>;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    showParentField?: boolean;
    parentLabel?: string;
}

function InlineForm({ form, onSubmit, onCancel, showParentField, parentLabel }: InlineFormProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-wrap gap-3 items-end py-2">
            <div className="flex-1 min-w-40">
                <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                <input
                    type="text"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    className={inputCls()}
                    placeholder="Category name"
                    required
                />
                {form.errors.name && <p className="text-xs text-red-600 mt-1">{form.errors.name}</p>}
            </div>
            <div className="flex-1 min-w-40">
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <input
                    type="text"
                    value={form.data.description}
                    onChange={(e) => form.setData('description', e.target.value)}
                    className={inputCls()}
                    placeholder="Optional description"
                />
            </div>
            {showParentField && parentLabel && (
                <div className="text-xs text-slate-500 self-end pb-2">
                    Parent: <span className="font-medium text-slate-700">{parentLabel}</span>
                </div>
            )}
            <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save'}
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

interface CategoryRowProps {
    category: Category;
    depth: number;
    editMode: EditMode;
    setEditMode: (mode: EditMode) => void;
    editForm: ReturnType<typeof useForm<InlineFormData>>;
    addChildForm: ReturnType<typeof useForm<InlineFormData>>;
    onDelete: (id: number, name: string) => void;
    can: (perm: string) => boolean;
    onStartEdit: (cat: Category) => void;
    onStartAddChild: (cat: Category) => void;
    handleUpdate: (e: React.FormEvent, id: number) => void;
    handleAddChild: (e: React.FormEvent) => void;
}

function CategoryRow({
    category, depth, editMode, setEditMode,
    editForm, addChildForm, onDelete, can,
    onStartEdit, onStartAddChild, handleUpdate, handleAddChild,
}: CategoryRowProps) {
    const isEditing = editMode?.type === 'edit' && editMode.id === category.id;
    const isAddingChild = editMode?.type === 'add-child' && editMode.parentId === category.id;

    return (
        <>
            <tr className="hover:bg-slate-50">
                {isEditing ? (
                    <td colSpan={5} className="px-4 py-2">
                        <InlineForm
                            form={editForm}
                            onSubmit={(e) => handleUpdate(e, category.id)}
                            onCancel={() => setEditMode(null)}
                        />
                    </td>
                ) : (
                    <>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            <span style={{ paddingLeft: `${depth * 1.5}rem` }} className="flex items-center gap-1">
                                {depth > 0 && <span className="text-slate-400 mr-1">└</span>}
                                {category.name}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-slate-400">{category.slug}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{category.description ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{category.products_count ?? 0}</td>
                        <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-3">
                                {can('inventory.create') && (
                                    <button
                                        onClick={() => onStartAddChild(category)}
                                        className="text-sm text-slate-500 hover:text-indigo-700"
                                    >
                                        + Sub
                                    </button>
                                )}
                                {can('inventory.update') && (
                                    <button
                                        onClick={() => onStartEdit(category)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        Edit
                                    </button>
                                )}
                                {can('inventory.delete') && (
                                    <button
                                        onClick={() => onDelete(category.id, category.name)}
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
            {isAddingChild && (
                <tr className="bg-indigo-50">
                    <td colSpan={5} className="px-4 py-2">
                        <InlineForm
                            form={addChildForm}
                            onSubmit={handleAddChild}
                            onCancel={() => setEditMode(null)}
                            showParentField
                            parentLabel={category.name}
                        />
                    </td>
                </tr>
            )}
            {category.children?.map((child) => (
                <CategoryRow
                    key={child.id}
                    category={child}
                    depth={depth + 1}
                    editMode={editMode}
                    setEditMode={setEditMode}
                    editForm={editForm}
                    addChildForm={addChildForm}
                    onDelete={onDelete}
                    can={can}
                    onStartEdit={onStartEdit}
                    onStartAddChild={onStartAddChild}
                    handleUpdate={handleUpdate}
                    handleAddChild={handleAddChild}
                />
            ))}
        </>
    );
}

export default function CategoriesIndex({ categories }: Props) {
    const { can } = usePermission();
    const [editMode, setEditMode] = useState<EditMode>(null);

    const createForm = useForm<InlineFormData>({ name: '', description: '', parent_id: null });
    const editForm = useForm<InlineFormData>({ name: '', description: '', parent_id: null });
    const addChildForm = useForm<InlineFormData>({ name: '', description: '', parent_id: null });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/inventory/categories', { onSuccess: () => createForm.reset() });
    }

    function handleUpdate(e: React.FormEvent, id: number) {
        e.preventDefault();
        editForm.put(`/inventory/categories/${id}`, { onSuccess: () => setEditMode(null) });
    }

    function handleAddChild(e: React.FormEvent) {
        e.preventDefault();
        addChildForm.post('/inventory/categories', { onSuccess: () => setEditMode(null) });
    }

    function handleDelete(id: number, name: string) {
        if (!confirm(`Delete category "${name}"?`)) return;
        router.delete(`/inventory/categories/${id}`);
    }

    function onStartEdit(cat: Category) {
        setEditMode({ type: 'edit', id: cat.id });
        editForm.setData({ name: cat.name, description: cat.description ?? '', parent_id: cat.parent_id ?? null });
    }

    function onStartAddChild(cat: Category) {
        setEditMode({ type: 'add-child', parentId: cat.id });
        addChildForm.setData({ name: '', description: '', parent_id: cat.id });
    }

    const totalCount = categories.reduce((acc, c) => acc + 1 + (c.children?.length ?? 0), 0);

    return (
        <AppLayout>
            <Head title="Categories" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
                        <p className="text-sm text-slate-500 mt-1">{totalCount} categories</p>
                    </div>
                </div>

                {can('inventory.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-medium text-slate-700 mb-3">Add Top-Level Category</h2>
                        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
                            <div className="flex-1 min-w-40">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className={inputCls()}
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
                                    className={inputCls()}
                                    placeholder="Optional description"
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
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Slug</th>
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
                                <CategoryRow
                                    key={cat.id}
                                    category={cat}
                                    depth={0}
                                    editMode={editMode}
                                    setEditMode={setEditMode}
                                    editForm={editForm}
                                    addChildForm={addChildForm}
                                    onDelete={handleDelete}
                                    can={can}
                                    onStartEdit={onStartEdit}
                                    onStartAddChild={onStartAddChild}
                                    handleUpdate={handleUpdate}
                                    handleAddChild={handleAddChild}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

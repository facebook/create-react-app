import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    article_count: number;
    children?: Category[];
}

interface Props extends PageProps {
    categories: Category[];
}

function CategoryRow({ category, depth = 0 }: { category: Category; depth?: number }) {
    return (
        <>
            <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900" style={{ paddingLeft: `${16 + depth * 20}px` }}>
                    {category.name}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-500">{category.slug}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{category.description ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        {category.article_count}
                    </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                    <button
                        onClick={() => {
                            if (confirm(`Delete category "${category.name}"?`)) {
                                router.delete(`/kb/categories/${category.id}`);
                            }
                        }}
                        className="text-red-400 hover:text-red-600 text-xs"
                    >
                        Delete
                    </button>
                </td>
            </tr>
            {category.children?.map((child) => (
                <CategoryRow key={child.id} category={child} depth={depth + 1} />
            ))}
        </>
    );
}

export default function KBCategories({ categories }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        parent_id: '',
        sequence: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/kb/categories', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    }

    const inputClass =
        'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

    // Flatten categories for parent select
    const flatCategories: Category[] = [];
    function flatten(cats: Category[]) {
        cats.forEach((c) => {
            flatCategories.push(c);
            if (c.children) flatten(c.children);
        });
    }
    flatten(categories);

    return (
        <AppLayout>
            <Head title="KB Categories" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Knowledge Base Categories</h1>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Category'}
                    </Button>
                </div>

                {showForm && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-sm font-semibold text-slate-700">New Category</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={inputClass}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Parent Category</label>
                                    <select
                                        value={data.parent_id}
                                        onChange={(e) => setData('parent_id', e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">— Top Level —</option>
                                        {flatCategories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className={inputClass}
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Sequence</label>
                                    <input
                                        type="number"
                                        value={data.sequence}
                                        onChange={(e) => setData('sequence', e.target.value)}
                                        className={inputClass}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Category'}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => { reset(); setShowForm(false); }}
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <h2 className="text-sm font-medium text-slate-700">
                            Categories ({flatCategories.length})
                        </h2>
                    </div>
                    {categories.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-slate-400">
                            No categories yet. Create one above.
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Name</th>
                                    <th className="px-4 py-2 text-left font-medium">Slug</th>
                                    <th className="px-4 py-2 text-left font-medium">Description</th>
                                    <th className="px-4 py-2 text-center font-medium">Articles</th>
                                    <th className="px-4 py-2 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categories.map((cat) => (
                                    <CategoryRow key={cat.id} category={cat} />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

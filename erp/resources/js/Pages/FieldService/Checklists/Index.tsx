import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ChecklistItem {
    label: string;
    sequence: number;
}

interface Checklist {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    items_count: number;
}

interface Props extends PageProps {
    checklists: Checklist[];
}

export default function ChecklistsIndex({ checklists }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        description: string;
        is_active: boolean;
        items: ChecklistItem[];
    }>({
        name: '',
        description: '',
        is_active: true,
        items: [],
    });

    const addItem = () => {
        setData('items', [...data.items, { label: '', sequence: data.items.length }]);
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const updateItemLabel = (index: number, label: string) => {
        const updated = [...data.items];
        updated[index] = { ...updated[index], label };
        setData('items', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/field-service/checklists', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const destroy = (id: number) => {
        if (confirm('Delete this checklist?')) {
            router.delete(`/field-service/checklists/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Service Checklists" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Service Checklists</h1>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add Checklist'}
                    </Button>
                </div>

                {/* Inline Add Form */}
                {showForm && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-800">New Checklist</h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Name *</label>
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Description</label>
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Checklist Items</label>
                                    <button type="button" onClick={addItem} className="text-sm text-indigo-600 hover:text-indigo-800">+ Add Item</button>
                                </div>
                                {data.items.map((item, i) => (
                                    <div key={i} className="mb-2 flex items-center gap-2">
                                        <span className="text-xs text-slate-400 w-6">{i + 1}.</span>
                                        <input
                                            type="text"
                                            className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm"
                                            placeholder="Item label"
                                            value={item.label}
                                            onChange={(e) => updateItemLabel(i, e.target.value)}
                                        />
                                        <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-xs px-1">✕</button>
                                    </div>
                                ))}
                                {data.items.length === 0 && (
                                    <p className="text-sm text-slate-400">No items yet.</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>Create Checklist</Button>
                                <Button type="button" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Checklists Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-slate-500">Items</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-slate-500">Active</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {checklists.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No checklists found</td>
                                    </tr>
                                )}
                                {checklists.map((checklist) => (
                                    <tr key={checklist.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{checklist.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{checklist.description ?? '—'}</td>
                                        <td className="px-4 py-3 text-center text-sm text-slate-700">{checklist.items_count}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${checklist.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {checklist.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => destroy(checklist.id)}
                                                className="text-xs text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { SkillDefinition } from '@/types/hr';

interface Props extends PageProps {
    definitions: SkillDefinition[];
}

export default function SkillDefinitionsIndex({ definitions }: Props) {
    const { can } = usePermission();

    const addForm = useForm({
        name: '',
        category: '',
        description: '',
    });

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post('/hr/skill-definitions', {
            onSuccess: () => addForm.reset(),
        });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this skill definition?')) {
            router.delete(`/hr/skill-definitions/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Skill Definitions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Skill Definitions</h1>
                        <p className="text-sm text-slate-500 mt-1">{definitions.length} definitions</p>
                    </div>
                </div>

                {can('hr.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Add Skill Definition</h2>
                        <form onSubmit={submitAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {addForm.errors.name && <p className="mt-1 text-xs text-red-600">{addForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={addForm.data.category}
                                    onChange={(e) => addForm.setData('category', e.target.value)}
                                    placeholder="technical, soft, language, management"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={addForm.data.description}
                                    onChange={(e) => addForm.setData('description', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                                <Button type="submit" disabled={addForm.processing}>
                                    {addForm.processing ? 'Adding…' : 'Add Definition'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'name',
                                header: 'Name',
                                render: (d) => <span className="text-sm font-medium text-slate-900">{d.name}</span>,
                            },
                            {
                                key: 'category',
                                header: 'Category',
                                render: (d) => <span className="text-sm text-slate-700">{d.category ?? '—'}</span>,
                            },
                            {
                                key: 'is_active',
                                header: 'Status',
                                render: (d) => d.is_active ? (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Active</span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">Inactive</span>
                                ),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (d) => can('hr.delete') ? (
                                    <button
                                        onClick={() => handleDelete(d.id)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                ) : null,
                            },
                        ]}
                        data={definitions}
                        emptyMessage="No skill definitions found."
                    />
                </div>
            </div>
        </AppLayout>
    );
}

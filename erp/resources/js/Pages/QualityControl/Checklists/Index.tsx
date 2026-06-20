import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface ChecklistItem {
    id: number;
    name: string;
    description: string;
    category: 'incoming' | 'process' | 'final' | 'audit';
    is_active: boolean;
    items_count?: number;
    created_at: string;
}

interface PaginatedChecklists {
    data: ChecklistItem[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    checklists: PaginatedChecklists;
}

const categoryColors: Record<string, string> = {
    incoming: 'bg-blue-100 text-blue-700',
    process: 'bg-yellow-100 text-yellow-700',
    final: 'bg-green-100 text-green-700',
    audit: 'bg-purple-100 text-purple-700',
};

export default function ChecklistsIndex({ checklists }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        category: 'process' as const,
        is_active: true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/quality/checklists', {
            onSuccess: () => reset(),
        });
    }

    return (
        <AppLayout>
            <Head title="QC Checklists" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">QC Checklists</h1>
                        <p className="text-sm text-slate-500 mt-1">{checklists.total} checklists</p>
                    </div>
                </div>

                {/* Create Form */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-medium text-slate-900 mb-4">Create Checklist</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Checklist name"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Optional description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                            <select
                                value={data.category}
                                onChange={e => setData('category', e.target.value as any)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="incoming">Incoming</option>
                                <option value="process">Process</option>
                                <option value="final">Final</option>
                                <option value="audit">Audit</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600"
                                />
                                <span className="text-sm text-slate-700">Active</span>
                            </label>
                            <button
                                type="submit"
                                disabled={processing}
                                className="ml-auto rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {checklists.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No checklists found.
                                    </td>
                                </tr>
                            ) : (
                                checklists.data.map((checklist) => (
                                    <tr key={checklist.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{checklist.name}</div>
                                            {checklist.description && (
                                                <div className="text-sm text-slate-500">{checklist.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${categoryColors[checklist.category] ?? 'bg-slate-100 text-slate-700'}`}>
                                                {checklist.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {checklist.items_count ?? 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${checklist.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {checklist.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

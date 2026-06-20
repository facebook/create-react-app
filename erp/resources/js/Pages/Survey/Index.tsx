import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface Survey {
    id: number;
    title: string;
    description: string | null;
    status: 'draft' | 'published' | 'closed';
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
}

interface Paginated {
    data: Survey[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    surveys: Paginated;
    filters: { status?: string };
}

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    published: 'bg-green-100 text-green-700',
    closed:    'bg-red-100 text-red-700',
};

export default function SurveyIndex({ surveys, filters }: Props) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title:       '',
        description: '',
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        post('/surveys', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    }

    function filterStatus(value: string) {
        router.get('/surveys', { ...filters, status: value || undefined }, { preserveState: true, replace: true });
    }

    function publish(id: number) {
        router.post(`/surveys/${id}/publish`);
    }

    function close(id: number) {
        router.post(`/surveys/${id}/close`);
    }

    return (
        <AppLayout>
            <Head title="Surveys" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Surveys</h1>
                        <p className="text-sm text-slate-500 mt-1">{surveys.total} records</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>New Survey</Button>
                </div>

                {showForm && (
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-medium text-slate-800 mb-4">Create Survey</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Survey title"
                                />
                                {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Optional description"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>Create</Button>
                                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filter */}
                <div className="flex gap-3">
                    <select
                        value={filters.status ?? ''}
                        onChange={e => filterStatus(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Created</th>
                                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {surveys.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center text-slate-400 py-8">No surveys found.</td>
                                </tr>
                            )}
                            {surveys.data.map(survey => (
                                <tr key={survey.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/surveys/${survey.id}`} className="font-medium text-indigo-600 hover:underline">
                                            {survey.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[survey.status]}`}>
                                            {survey.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {new Date(survey.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        {survey.status === 'draft' && (
                                            <button
                                                onClick={() => publish(survey.id)}
                                                className="text-xs text-green-600 hover:text-green-800 font-medium"
                                            >
                                                Publish
                                            </button>
                                        )}
                                        {survey.status === 'published' && (
                                            <button
                                                onClick={() => close(survey.id)}
                                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Close
                                            </button>
                                        )}
                                        <Link href={`/surveys/${survey.id}`} className="text-xs text-indigo-600 hover:underline">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {surveys.last_page > 1 && (
                    <div className="flex gap-2 justify-end">
                        {Array.from({ length: surveys.last_page }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => router.get('/surveys', { ...filters, page }, { preserveState: true })}
                                className={`px-3 py-1 rounded text-sm border ${page === surveys.current_page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

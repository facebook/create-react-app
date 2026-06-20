import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface WebPage {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    is_homepage: boolean;
    layout: string;
    published_at: string | null;
    created_at: string;
}

interface PaginatedPages {
    data: WebPage[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    pages: PaginatedPages;
}

const statusBadge = (status: WebPage['status']) => {
    const classes: Record<WebPage['status'], string> = {
        draft:     'bg-gray-100 text-gray-700',
        published: 'bg-green-100 text-green-700',
        archived:  'bg-yellow-100 text-yellow-700',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${classes[status]}`}>
            {status}
        </span>
    );
};

export default function PagesIndex({ pages }: Props) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title:  '',
        slug:   '',
        status: 'draft' as WebPage['status'],
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/website/pages', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    };

    const handlePublish = (page: WebPage) => {
        router.post(`/website/pages/${page.id}/publish`);
    };

    return (
        <AppLayout title="Web Pages">
            <Head title="Web Pages" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Web Pages</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        {showForm ? 'Cancel' : 'New Page'}
                    </button>
                </div>

                {/* Inline Create Form */}
                {showForm && (
                    <form onSubmit={handleCreate} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                        <h2 className="font-medium text-slate-800">Create Page</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                    required
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Slug</label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={e => setData('slug', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                    required
                                />
                                {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Status</label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value as WebPage['status'])}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Page'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Pages Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Slug</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Homepage</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {pages.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No pages yet.
                                    </td>
                                </tr>
                            )}
                            {pages.data.map((page) => (
                                <tr key={page.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{page.title}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{page.slug}</td>
                                    <td className="px-4 py-3">{statusBadge(page.status)}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {page.is_homepage && (
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                                Homepage
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {page.status !== 'published' && (
                                            <button
                                                onClick={() => handlePublish(page)}
                                                className="text-xs text-green-600 hover:text-green-800 font-medium"
                                            >
                                                Publish
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pages.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-slate-200 text-sm text-slate-500">
                            Page {pages.current_page} of {pages.last_page} — {pages.total} total
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

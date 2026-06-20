import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    view_count: number;
    tags: string[] | null;
    published_at: string | null;
    created_at: string;
    author_id: number | null;
}

interface PaginatedPosts {
    data: BlogPost[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    posts: PaginatedPosts;
}

const statusBadge = (status: BlogPost['status']) => {
    const classes: Record<BlogPost['status'], string> = {
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

export default function BlogIndex({ posts }: Props) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title:   '',
        slug:    '',
        content: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/website/blog', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    };

    const handlePublish = (blogPost: BlogPost) => {
        router.post(`/website/blog/${blogPost.id}/publish`);
    };

    return (
        <AppLayout title="Blog Posts">
            <Head title="Blog Posts" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Blog Posts</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        {showForm ? 'Cancel' : 'New Post'}
                    </button>
                </div>

                {/* Inline Create Form */}
                {showForm && (
                    <form onSubmit={handleCreate} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                        <h2 className="font-medium text-slate-800">Create Blog Post</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Content</label>
                            <textarea
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Post'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Posts Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Author</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Views</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tags</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {posts.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No blog posts yet.
                                    </td>
                                </tr>
                            )}
                            {posts.data.map((blogPost) => (
                                <tr key={blogPost.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{blogPost.title}</td>
                                    <td className="px-4 py-3">{statusBadge(blogPost.status)}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {blogPost.author_id ? `#${blogPost.author_id}` : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{blogPost.view_count}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {(blogPost.tags ?? []).map((tag) => (
                                                <span key={tag} className="px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {blogPost.status !== 'published' && (
                                            <button
                                                onClick={() => handlePublish(blogPost)}
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
                    {posts.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-slate-200 text-sm text-slate-500">
                            Page {posts.current_page} of {posts.last_page} — {posts.total} total
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

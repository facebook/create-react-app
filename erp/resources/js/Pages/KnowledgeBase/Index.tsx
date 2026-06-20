import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

interface Category {
    id: number;
    name: string;
    slug: string;
    article_count?: number;
    children?: Category[];
}

interface Article {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    views: number;
    created_at: string;
    published_at: string | null;
    category: Category | null;
    author: { id: number; name: string } | null;
}

interface PaginatedArticles {
    data: Article[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    articles: PaginatedArticles;
    categories: Category[];
    filters: { search?: string; category_id?: number };
}

const statusBadge = (status: Article['status']) => {
    const classes: Record<Article['status'], string> = {
        draft: 'bg-gray-100 text-gray-700',
        published: 'bg-green-100 text-green-700',
        archived: 'bg-yellow-100 text-yellow-700',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${classes[status]}`}>
            {status}
        </span>
    );
};

export default function Index({ articles, categories, filters }: Props) {
    const [showNewForm, setShowNewForm] = useState(false);
    const [search, setSearch] = useState(filters.search ?? '');

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        content: '',
        category_id: '',
        excerpt: '',
        tags: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/kb', { search }, { preserveState: true, replace: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/kb', {
            onSuccess: () => { reset(); setShowNewForm(false); },
        });
    };

    const handlePublish = (article: Article) => {
        router.post(`/kb/${article.id}/publish`);
    };

    const handleArchive = (article: Article) => {
        router.post(`/kb/${article.id}/archive`);
    };

    const CategoryTree = ({ cats }: { cats: Category[] }) => (
        <ul className="space-y-1">
            {cats.map((cat) => (
                <li key={cat.id}>
                    <button
                        className="text-left w-full px-2 py-1 rounded hover:bg-gray-100 text-sm flex justify-between"
                        onClick={() => router.get('/kb', { category_id: cat.id }, { preserveState: true, replace: true })}
                    >
                        <span>{cat.name}</span>
                        <span className="text-gray-400 text-xs">{cat.article_count ?? 0}</span>
                    </button>
                    {cat.children && cat.children.length > 0 && (
                        <div className="ml-4">
                            <CategoryTree cats={cat.children} />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <>
            <Head title="Knowledge Base" />
            <div className="flex h-full min-h-screen bg-gray-50">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r p-4 shrink-0">
                    <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-3">Categories</h2>
                    <CategoryTree cats={categories} />
                </aside>

                {/* Main */}
                <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Knowledge Base</h1>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            onClick={() => setShowNewForm(!showNewForm)}
                        >
                            {showNewForm ? 'Cancel' : 'New Article'}
                        </button>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search articles..."
                            className="border rounded px-3 py-2 flex-1 text-sm"
                        />
                        <button type="submit" className="px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300">Search</button>
                    </form>

                    {/* New Article Form */}
                    {showNewForm && (
                        <form onSubmit={handleCreate} className="mb-6 bg-white border rounded-lg p-4 space-y-3">
                            <h3 className="font-semibold text-sm text-gray-700">Create New Article</h3>
                            <input
                                type="text"
                                placeholder="Title *"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="border rounded px-3 py-2 w-full text-sm"
                                required
                            />
                            {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="border rounded px-3 py-2 w-full text-sm"
                            >
                                <option value="">No Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <textarea
                                placeholder="Content *"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                className="border rounded px-3 py-2 w-full text-sm h-32"
                                required
                            />
                            {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
                            <input
                                type="text"
                                placeholder="Excerpt (optional)"
                                value={data.excerpt}
                                onChange={(e) => setData('excerpt', e.target.value)}
                                className="border rounded px-3 py-2 w-full text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Tags (comma-separated)"
                                value={data.tags}
                                onChange={(e) => setData('tags', e.target.value)}
                                className="border rounded px-3 py-2 w-full text-sm"
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Creating…' : 'Create Article'}
                            </button>
                        </form>
                    )}

                    {/* Articles Table */}
                    <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Views</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Author</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {articles.data.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <a href={`/kb/${article.id}`} className="text-blue-600 hover:underline font-medium">
                                                {article.title}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{article.category?.name ?? '—'}</td>
                                        <td className="px-4 py-3">{statusBadge(article.status)}</td>
                                        <td className="px-4 py-3 text-gray-500">{article.views}</td>
                                        <td className="px-4 py-3 text-gray-500">{article.author?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {article.published_at
                                                ? new Date(article.published_at).toLocaleDateString()
                                                : new Date(article.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 space-x-1">
                                            {article.status !== 'published' && (
                                                <button
                                                    onClick={() => handlePublish(article)}
                                                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                >
                                                    Publish
                                                </button>
                                            )}
                                            {article.status !== 'archived' && (
                                                <button
                                                    onClick={() => handleArchive(article)}
                                                    className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                                >
                                                    Archive
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {articles.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No articles found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination info */}
                    <p className="text-sm text-gray-400 mt-2">
                        Showing {articles.data.length} of {articles.total} articles
                    </p>
                </div>
            </div>
        </>
    );
}

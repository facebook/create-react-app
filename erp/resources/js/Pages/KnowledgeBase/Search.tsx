import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Category {
    id: number;
    name: string;
}

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    status: 'draft' | 'published' | 'archived';
    views: number;
    published_at: string | null;
    created_at: string;
    category: Category | null;
    author: { id: number; name: string } | null;
}

interface PaginatedArticles {
    data: Article[];
    total: number;
    current_page: number;
    last_page: number;
}

interface Props extends PageProps {
    articles: PaginatedArticles;
    query: string;
}

const STATUS_BADGES: Record<string, string> = {
    draft:    'bg-gray-100 text-gray-700',
    published:'bg-green-100 text-green-700',
    archived: 'bg-yellow-100 text-yellow-700',
};

export default function KBSearch({ articles, query }: Props) {
    const [searchQuery, setSearchQuery] = useState(query);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/kb/search', { q: searchQuery }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title={`Search — ${query || 'Knowledge Base'}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Search Knowledge Base</h1>
                    {query && (
                        <p className="mt-1 text-sm text-slate-500">
                            {articles.total} result{articles.total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                        </p>
                    )}
                </div>

                {/* Search box */}
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search articles..."
                        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        Search
                    </button>
                    <Link
                        href="/kb"
                        className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Browse All
                    </Link>
                </form>

                {/* Results */}
                {!query && (
                    <p className="text-center text-sm text-slate-400 py-8">
                        Enter a search query to find articles.
                    </p>
                )}

                {query && articles.data.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <p className="text-slate-500">No articles found for &ldquo;{query}&rdquo;.</p>
                        <Link href="/kb" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
                            Browse all articles
                        </Link>
                    </div>
                )}

                {articles.data.length > 0 && (
                    <div className="space-y-3">
                        {articles.data.map((article) => (
                            <div
                                key={article.id}
                                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <a
                                            href={`/kb/${article.id}`}
                                            className="text-base font-semibold text-indigo-700 hover:underline"
                                        >
                                            {article.title}
                                        </a>
                                        {article.excerpt && (
                                            <p className="mt-1 text-sm text-slate-600 line-clamp-2">{article.excerpt}</p>
                                        )}
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                            {article.category && (
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                                                    {article.category.name}
                                                </span>
                                            )}
                                            {article.author && <span>by {article.author.name}</span>}
                                            <span>
                                                {article.published_at
                                                    ? new Date(article.published_at).toLocaleDateString()
                                                    : new Date(article.created_at).toLocaleDateString()}
                                            </span>
                                            <span>{article.views} views</span>
                                        </div>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[article.status] ?? 'bg-gray-100 text-gray-700'}`}
                                    >
                                        {article.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {articles.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>
                            Page {articles.current_page} of {articles.last_page}
                        </span>
                        <div className="flex gap-2">
                            {articles.current_page > 1 && (
                                <button
                                    onClick={() =>
                                        router.get(
                                            '/kb/search',
                                            { q: query, page: articles.current_page - 1 },
                                            { preserveState: true },
                                        )
                                    }
                                    className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50"
                                >
                                    Previous
                                </button>
                            )}
                            {articles.current_page < articles.last_page && (
                                <button
                                    onClick={() =>
                                        router.get(
                                            '/kb/search',
                                            { q: query, page: articles.current_page + 1 },
                                            { preserveState: true },
                                        )
                                    }
                                    className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

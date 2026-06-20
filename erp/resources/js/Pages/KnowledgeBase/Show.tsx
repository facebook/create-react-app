import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import RichTextEditor from '@/Components/RichTextEditor';

interface Category {
    id: number;
    name: string;
    slug: string;
    parent?: Category | null;
}

interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    status: 'draft' | 'published' | 'archived';
    views: number;
    tags: string[] | null;
    published_at: string | null;
    created_at: string;
    category: Category | null;
    author: { id: number; name: string } | null;
}

interface Props {
    article: Article;
}

export default function Show({ article }: Props) {
    const [showEditForm, setShowEditForm] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt ?? '',
        tags: (article.tags ?? []).join(', '),
        category_id: article.category?.id?.toString() ?? '',
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/kb/${article.id}`, {
            onSuccess: () => setShowEditForm(false),
        });
    };

    const handlePublish = () => router.post(`/kb/${article.id}/publish`);
    const handleArchive = () => router.post(`/kb/${article.id}/archive`);

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

    return (
        <>
            <Head title={article.title} />
            <div className="max-w-4xl mx-auto p-6">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-4">
                    <a href="/kb" className="hover:underline">Knowledge Base</a>
                    {article.category && (
                        <>
                            <span className="mx-1">/</span>
                            <span>{article.category.name}</span>
                        </>
                    )}
                    <span className="mx-1">/</span>
                    <span className="text-gray-800">{article.title}</span>
                </nav>

                {/* Article Header */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{article.title}</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                                {statusBadge(article.status)}
                                {article.author && <span>By {article.author.name}</span>}
                                {article.published_at && (
                                    <span>Published {new Date(article.published_at).toLocaleDateString()}</span>
                                )}
                                <span>{article.views} views</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {article.status === 'draft' && (
                                <button
                                    onClick={() => setShowEditForm(!showEditForm)}
                                    className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                                >
                                    {showEditForm ? 'Cancel Edit' : 'Edit'}
                                </button>
                            )}
                            {article.status !== 'published' && (
                                <button
                                    onClick={handlePublish}
                                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Publish
                                </button>
                            )}
                            {article.status !== 'archived' && (
                                <button
                                    onClick={handleArchive}
                                    className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Archive
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="mt-3 flex gap-1 flex-wrap">
                            {article.tags.map((tag) => (
                                <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit Form (for draft articles) */}
                {showEditForm && article.status === 'draft' && (
                    <form onSubmit={handleUpdate} className="bg-white border rounded-lg p-4 mb-6 space-y-3">
                        <h3 className="font-semibold text-sm text-gray-700">Edit Article</h3>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Title"
                            className="border rounded px-3 py-2 w-full text-sm"
                        />
                        {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                        <RichTextEditor
                            content={data.content}
                            onChange={(html) => setData('content', html)}
                            placeholder="Write article content…"
                            minHeight="250px"
                        />
                        {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
                        <input
                            type="text"
                            value={data.excerpt}
                            onChange={(e) => setData('excerpt', e.target.value)}
                            placeholder="Excerpt"
                            className="border rounded px-3 py-2 w-full text-sm"
                        />
                        <input
                            type="text"
                            value={data.tags}
                            onChange={(e) => setData('tags', e.target.value)}
                            placeholder="Tags (comma-separated)"
                            className="border rounded px-3 py-2 w-full text-sm"
                        />
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </form>
                )}

                {/* Article Content */}
                <div className="bg-white rounded-lg border p-6">
                    {article.excerpt && (
                        <p className="text-gray-600 italic mb-4 border-l-4 border-blue-300 pl-4">{article.excerpt}</p>
                    )}
                    <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">{article.content}</pre>
                    </div>
                </div>
            </div>
        </>
    );
}

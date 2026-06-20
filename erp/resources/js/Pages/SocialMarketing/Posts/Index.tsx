import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Author {
    id: number;
    name: string;
}

interface SocialPost {
    id: number;
    content: string;
    platforms: string[];
    status: string;
    scheduled_at: string | null;
    published_at: string | null;
    metrics: { likes?: number; shares?: number; comments?: number; reach?: number; impressions?: number } | null;
    author: Author | null;
}

interface PaginatedPosts {
    data: SocialPost[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    posts: PaginatedPosts;
    currentStatus: string;
}

const statusColors: Record<string, string> = {
    draft:      'bg-slate-100 text-slate-700',
    scheduled:  'bg-blue-100 text-blue-700',
    publishing: 'bg-yellow-100 text-yellow-700',
    published:  'bg-green-100 text-green-700',
    failed:     'bg-red-100 text-red-700',
};

const platformColors: Record<string, string> = {
    facebook:  'bg-blue-100 text-blue-700',
    twitter:   'bg-sky-100 text-sky-700',
    linkedin:  'bg-blue-200 text-blue-800',
    instagram: 'bg-pink-100 text-pink-700',
    youtube:   'bg-red-100 text-red-700',
    tiktok:    'bg-slate-100 text-slate-800',
};

const statusTabs = ['', 'draft', 'scheduled', 'published', 'failed'];
const statusLabels: Record<string, string> = {
    '':          'All',
    draft:       'Draft',
    scheduled:   'Scheduled',
    published:   'Published',
    failed:      'Failed',
};

function getTotalReach(metrics: SocialPost['metrics']): number {
    return metrics?.reach ?? 0;
}

function getTotalEngagement(metrics: SocialPost['metrics']): number {
    return (metrics?.likes ?? 0) + (metrics?.shares ?? 0) + (metrics?.comments ?? 0);
}

export default function PostsIndex({ posts, currentStatus }: Props) {
    function handlePublish(postId: number) {
        router.post(`/social-marketing/posts/${postId}/publish`);
    }

    function handleDelete(postId: number) {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(`/social-marketing/posts/${postId}`);
        }
    }

    function handleFilterChange(status: string) {
        router.get('/social-marketing/posts', status ? { status } : {}, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Social Posts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Social Posts</h1>
                    <Link
                        href="/social-marketing/posts/create"
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        New Post
                    </Link>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {statusTabs.map((status) => (
                        <button
                            key={status}
                            onClick={() => handleFilterChange(status)}
                            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                currentStatus === status
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {statusLabels[status]}
                        </button>
                    ))}
                </div>

                {/* Posts Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Content</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Platforms</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Reach</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Engagement</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {posts.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                                            No posts found
                                        </td>
                                    </tr>
                                )}
                                {posts.data.map((post) => (
                                    <tr key={post.id} className="hover:bg-slate-50">
                                        <td className="max-w-xs px-4 py-3 text-sm text-slate-700">
                                            {post.content.length > 80
                                                ? post.content.substring(0, 80) + '...'
                                                : post.content}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {post.platforms.map((p) => (
                                                    <span
                                                        key={p}
                                                        className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium capitalize ${platformColors[p] ?? 'bg-slate-100 text-slate-700'}`}
                                                    >
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[post.status] ?? statusColors.draft}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {post.published_at ?? post.scheduled_at ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">
                                            {getTotalReach(post.metrics)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-700">
                                            {getTotalEngagement(post.metrics)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {post.status === 'draft' && (
                                                    <button
                                                        onClick={() => handlePublish(post.id)}
                                                        className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                                                    >
                                                        Publish
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
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

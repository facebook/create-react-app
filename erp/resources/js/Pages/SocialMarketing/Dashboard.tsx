import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    total_accounts: number;
    connected_accounts: number;
    total_posts: number;
    scheduled_posts: number;
    published_this_month: number;
    total_reach: number;
}

interface Props extends PageProps {
    stats: Stats;
}

const platformBadges = [
    { name: 'Facebook',  emoji: '📘', color: 'bg-blue-100 text-blue-700' },
    { name: 'Twitter',   emoji: '🐦', color: 'bg-sky-100 text-sky-700' },
    { name: 'LinkedIn',  emoji: '💼', color: 'bg-blue-100 text-blue-800' },
    { name: 'Instagram', emoji: '📸', color: 'bg-pink-100 text-pink-700' },
    { name: 'YouTube',   emoji: '▶️', color: 'bg-red-100 text-red-700' },
    { name: 'TikTok',    emoji: '🎵', color: 'bg-slate-100 text-slate-800' },
];

export default function SocialMarketingDashboard({ stats }: Props) {
    const kpis = [
        { label: 'Total Accounts',        value: stats.total_accounts,        color: 'text-slate-700' },
        { label: 'Connected Accounts',    value: stats.connected_accounts,    color: 'text-green-600' },
        { label: 'Total Posts',           value: stats.total_posts,           color: 'text-indigo-600' },
        { label: 'Scheduled Posts',       value: stats.scheduled_posts,       color: 'text-blue-600' },
        { label: 'Published This Month',  value: stats.published_this_month,  color: 'text-emerald-600' },
        { label: 'Total Reach',           value: stats.total_reach.toLocaleString(), color: 'text-purple-600' },
    ];

    return (
        <AppLayout>
            <Head title="Social Marketing Dashboard" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Social Marketing</h1>
                    <Link
                        href="/social-marketing/posts/create"
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        New Post
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {kpis.map((kpi) => (
                        <div key={kpi.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-medium uppercase text-slate-500">{kpi.label}</p>
                            <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                        </div>
                    ))}
                </div>

                {/* Platform Badges */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-800">Supported Platforms</h2>
                    <div className="flex flex-wrap gap-3">
                        {platformBadges.map((p) => (
                            <span key={p.name} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${p.color}`}>
                                <span>{p.emoji}</span>
                                {p.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                    <Link
                        href="/social-marketing/accounts"
                        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        <p className="text-base font-semibold text-slate-800">Accounts</p>
                        <p className="mt-1 text-sm text-slate-500">Manage connected social media accounts</p>
                    </Link>
                    <Link
                        href="/social-marketing/posts"
                        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        <p className="text-base font-semibold text-slate-800">Posts</p>
                        <p className="mt-1 text-sm text-slate-500">Create, schedule, and manage posts</p>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

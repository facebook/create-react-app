import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    open_sessions: number;
    assigned_sessions: number;
    resolved_today: number;
    missed_today: number;
    channels_count: number;
    avg_rating: number;
}

interface Props extends PageProps {
    stats: Stats;
}

function StarRating({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(value) ? 'text-yellow-400' : 'text-slate-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.376 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.376 2.454c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.632 9.394c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.951-.69L9.049 2.927z" />
                </svg>
            ))}
            <span className="ml-1 text-sm text-slate-500">{value > 0 ? value.toFixed(1) : '—'}</span>
        </div>
    );
}

export default function LiveChatDashboard({ stats }: Props) {
    const cards = [
        {
            label: 'Open Sessions',
            value: stats.open_sessions,
            color: 'text-blue-600',
            border: 'border-blue-200',
            href: '/live-chat/sessions?status=open',
        },
        {
            label: 'Assigned',
            value: stats.assigned_sessions,
            color: 'text-indigo-600',
            border: 'border-indigo-200',
            href: '/live-chat/sessions?status=assigned',
        },
        {
            label: 'Resolved Today',
            value: stats.resolved_today,
            color: 'text-green-600',
            border: 'border-green-200',
            href: '/live-chat/sessions?status=resolved',
        },
        {
            label: 'Missed Today',
            value: stats.missed_today,
            color: 'text-red-600',
            border: 'border-red-200',
            href: '/live-chat/sessions?status=missed',
        },
        {
            label: 'Channels',
            value: stats.channels_count,
            color: 'text-slate-700',
            border: 'border-slate-200',
            href: '/live-chat/channels',
        },
    ];

    return (
        <AppLayout>
            <Head title="Live Chat" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Live Chat</h1>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {cards.map((card) => (
                        <Link
                            key={card.label}
                            href={card.href}
                            className={`rounded-lg border bg-white p-5 shadow-sm hover:shadow-md transition-shadow ${card.border}`}
                        >
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
                            <p className={`mt-2 text-3xl font-bold ${card.color}`}>{card.value}</p>
                        </Link>
                    ))}

                    <div className={`rounded-lg border bg-white p-5 shadow-sm border-yellow-200`}>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Avg Rating</p>
                        <div className="mt-2">
                            <StarRating value={stats.avg_rating} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link
                        href="/live-chat/channels"
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm hover:bg-slate-50"
                    >
                        <span className="font-medium text-slate-800">Manage Channels</span>
                        <span className="text-slate-400">&rarr;</span>
                    </Link>
                    <Link
                        href="/live-chat/sessions"
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm hover:bg-slate-50"
                    >
                        <span className="font-medium text-slate-800">View All Sessions</span>
                        <span className="text-slate-400">&rarr;</span>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { NotificationInbox } from '@/types/notifications';

interface Props extends PageProps {
    notifications: Paginator<NotificationInbox>;
    unread_count: number;
}

const TYPE_COLORS: Record<string, string> = {
    'invoice.overdue': 'bg-red-100 text-red-700',
    'leave.submitted': 'bg-teal-100 text-teal-700',
    'stock.low':       'bg-amber-100 text-amber-700',
    info:              'bg-slate-100 text-slate-600',
};

function typeColor(type: string): string {
    return TYPE_COLORS[type] ?? TYPE_COLORS['info'];
}

export default function NotificationsIndex({ notifications, unread_count }: Props) {
    return (
        <AppLayout>
            <Head title="Notifications" />
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
                            {unread_count > 0 && (
                                <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                                    {unread_count}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{notifications.total} total</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {unread_count > 0 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => router.post('/notifications/mark-all-read')}
                            >
                                Mark all read
                            </Button>
                        )}
                        <Link href="/notification-rules">
                            <Button variant="secondary" size="sm">
                                Manage Rules
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
                    {notifications.data.map((n) => (
                        <div
                            key={n.id}
                            className={`flex gap-4 p-4 ${!n.is_read ? 'border-l-4 border-l-indigo-500 bg-indigo-50/30' : ''}`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {!n.is_read && (
                                        <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                                    )}
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColor(n.type)}`}>
                                        {n.type}
                                    </span>
                                    <span className="text-xs text-slate-400">{n.created_at}</span>
                                </div>
                                <p className={`text-sm text-slate-900 ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>
                                    {n.title}
                                </p>
                                {n.body && (
                                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 shrink-0 items-end">
                                {n.link && (
                                    <Link
                                        href={n.link}
                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        View
                                    </Link>
                                )}
                                {!n.is_read && (
                                    <button
                                        onClick={() => router.patch(`/notifications/${n.id}/read`)}
                                        className="text-xs text-slate-500 hover:text-slate-700"
                                    >
                                        Mark read
                                    </button>
                                )}
                                <button
                                    onClick={() => router.delete(`/notifications/${n.id}`)}
                                    className="text-xs text-red-500 hover:text-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {notifications.data.length === 0 && (
                        <div className="px-4 py-12 text-center text-sm text-slate-400">
                            No notifications yet.
                        </div>
                    )}
                </div>

                <Pagination paginator={notifications} />
            </div>
        </AppLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    created_at: string;
}

interface Props extends PageProps {
    notifications: Paginator<Notification>;
}

const TYPE_COLORS: Record<string, string> = {
    hr:        'bg-teal-100 text-teal-700',
    finance:   'bg-blue-100 text-blue-700',
    inventory: 'bg-amber-100 text-amber-700',
    info:      'bg-slate-100 text-slate-600',
};

export default function NotificationsIndex({ notifications }: Props) {
    const hasUnread = notifications.data.some((n) => !n.read);

    return (
        <AppLayout>
            <Head title="Notifications" />
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
                        <p className="text-sm text-slate-500 mt-1">{notifications.total} total</p>
                    </div>
                    {hasUnread && (
                        <Button variant="secondary" size="sm"
                            onClick={() => router.patch('/notifications/read-all')}>
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
                    {notifications.data.map((n) => (
                        <div key={n.id} className={`flex gap-4 p-4 ${n.read ? '' : 'bg-indigo-50/50'}`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[n.type] ?? TYPE_COLORS.info}`}>
                                        {n.type}
                                    </span>
                                    {!n.read && (
                                        <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                    )}
                                </div>
                                <p className="text-sm font-medium text-slate-900">{n.title}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                                <p className="text-xs text-slate-400 mt-1">{n.created_at}</p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                {n.link && (
                                    <Link href={n.link} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                        View
                                    </Link>
                                )}
                                {!n.read && (
                                    <button
                                        onClick={() => router.patch(`/notifications/${n.id}/read`)}
                                        className="text-xs text-slate-500 hover:text-slate-700">
                                        Mark read
                                    </button>
                                )}
                                <button
                                    onClick={() => router.delete(`/notifications/${n.id}`)}
                                    className="text-xs text-red-500 hover:text-red-700">
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

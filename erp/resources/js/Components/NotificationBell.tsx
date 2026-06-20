import { useEffect, useState } from 'react';
import axios from 'axios';
import { useEchoPrivateChannel } from '@/Hooks/useEchoChannel';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
}

interface Props {
    tenantId: number;
}

export default function NotificationBell({ tenantId }: Props) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        axios.get('/api/v1/notifications/unread-count').then(res => {
            setUnread(res.data.data.count);
        });
        if (open) {
            axios.get('/api/v1/notifications').then(res => {
                setNotifications(res.data.data ?? []);
            });
        }
    }, [open]);

    useEchoPrivateChannel(`tenant.${tenantId}`, '.ErpNotification', () => {
        setUnread(prev => prev + 1);
    });

    async function markAllRead() {
        await axios.post('/api/v1/notifications/mark-all-read');
        setUnread(0);
        setNotifications(prev =>
            prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
        );
    }

    async function markRead(id: number) {
        await axios.post(`/api/v1/notifications/${id}/read`);
        setNotifications(prev =>
            prev.map(n =>
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            )
        );
        setUnread(prev => Math.max(0, prev - 1));
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                </svg>
                {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                        <h3 className="text-sm font-semibold text-slate-800">
                            Notifications
                        </h3>
                        {unread > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 && (
                            <p className="px-4 py-6 text-center text-sm text-slate-400">
                                No notifications
                            </p>
                        )}
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => !n.read_at && markRead(n.id)}
                                className={`flex cursor-pointer gap-3 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50 ${
                                    !n.read_at ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div
                                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                                        !n.read_at
                                            ? 'bg-blue-500'
                                            : 'bg-transparent'
                                    }`}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-800">
                                        {n.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                                        {n.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

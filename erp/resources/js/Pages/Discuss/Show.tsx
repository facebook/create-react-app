import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useEchoPrivateChannel } from '@/Hooks/useEchoChannel';

interface Message {
    id: number;
    body: string;
    is_edited: boolean;
    is_pinned: boolean;
    created_at: string;
    user: { id: number; name: string };
    replies_count: number;
}

interface Channel {
    id: number;
    name: string;
    type: string;
    description: string | null;
}

interface Member {
    id: number;
    name: string;
}

interface Props {
    channel: Channel;
    messages: Message[];
    members: Member[];
}

function timeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
}

function initials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

const COLORS = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
];
function avatarColor(name: string): string {
    return COLORS[name.charCodeAt(0) % COLORS.length];
}

export default function DiscussShow({
    channel,
    messages: initialMessages,
    members,
}: Props) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Listen for messages sent by other users in this channel
    useEchoPrivateChannel(
        `discuss-channel.${channel.id}`,
        '.NewDiscussMessage',
        payload => {
            const msg = payload as Message;
            setMessages(prev =>
                prev.some(m => m.id === msg.id) ? prev : [...prev, msg]
            );
        }
    );

    async function send(e: React.FormEvent) {
        e.preventDefault();
        if (!body.trim() || sending) return;
        setSending(true);
        try {
            const res = await axios.post(`/discuss/${channel.id}/messages`, {
                body,
            });
            setMessages(prev => [...prev, res.data]);
            setBody('');
        } finally {
            setSending(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(e as unknown as React.FormEvent);
        }
    }

    return (
        <AppLayout>
            <Head title={`#${channel.name}`} />
            <div className="flex h-[calc(100vh-4rem)] flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
                    <Link
                        href="/discuss"
                        className="text-sm text-slate-500 hover:text-slate-700"
                    >
                        ← Channels
                    </Link>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-400 font-medium">#</span>
                    <h1 className="text-base font-semibold text-slate-800">
                        {channel.name}
                    </h1>
                    {channel.description && (
                        <span className="ml-2 text-sm text-slate-500">
                            — {channel.description}
                        </span>
                    )}
                    <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
                        <span>{members.length} members</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-white px-6 py-4">
                    {messages.length === 0 && (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-sm text-slate-400">
                                No messages yet. Say hello!
                            </p>
                        </div>
                    )}
                    <div className="space-y-4">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className="flex items-start gap-3"
                            >
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(
                                        msg.user.name
                                    )}`}
                                >
                                    {initials(msg.user.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-semibold text-slate-800">
                                            {msg.user.name}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {timeAgo(msg.created_at)}
                                        </span>
                                        {msg.is_edited && (
                                            <span className="text-xs text-slate-400">
                                                (edited)
                                            </span>
                                        )}
                                        {msg.is_pinned && (
                                            <span className="text-xs text-yellow-600">
                                                📌
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-sm text-slate-700 whitespace-pre-wrap break-words">
                                        {msg.body}
                                    </p>
                                    {msg.replies_count > 0 && (
                                        <button className="mt-1 text-xs text-blue-600 hover:underline">
                                            {msg.replies_count}{' '}
                                            {msg.replies_count === 1
                                                ? 'reply'
                                                : 'replies'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </div>

                {/* Input */}
                <div className="border-t border-slate-200 bg-white px-6 py-4">
                    <form onSubmit={send} className="flex items-end gap-3">
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Message #${channel.name} (Enter to send, Shift+Enter for new line)`}
                            rows={2}
                            className="flex-1 resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={!body.trim() || sending}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

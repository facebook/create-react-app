import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useEchoPrivateChannel } from '@/Hooks/useEchoChannel';

interface Agent {
    id: number;
    name: string;
}

interface Channel {
    id: number;
    name: string;
    widget_color: string;
}

interface Message {
    id: number;
    sender_type: 'visitor' | 'agent' | 'bot';
    agent: Agent | null;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface Session {
    id: number;
    visitor_name: string | null;
    visitor_email: string | null;
    source_url: string | null;
    status: 'open' | 'assigned' | 'resolved' | 'missed';
    channel: Channel | null;
    agent: Agent | null;
    messages: Message[];
    rating: number | null;
    rating_note: string | null;
    started_at: string | null;
    ended_at: string | null;
}

interface Props extends PageProps {
    session: Session;
}

const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    assigned: 'bg-indigo-100 text-indigo-700',
    resolved: 'bg-green-100 text-green-700',
    missed: 'bg-red-100 text-red-700',
};

function StarDisplay({ rating }: { rating: number | null }) {
    if (!rating)
        return <span className="text-slate-400 text-xs">Not rated</span>;
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <svg
                    key={star}
                    className={`h-4 w-4 ${
                        star <= rating ? 'text-yellow-400' : 'text-slate-200'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.376 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.376 2.454c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.632 9.394c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.951-.69L9.049 2.927z" />
                </svg>
            ))}
        </div>
    );
}

function formatTime(ts: string) {
    return new Date(ts).toLocaleString();
}

interface BroadcastMessage {
    id: number;
    session_id: number;
    sender_type: 'visitor' | 'agent' | 'bot';
    agent_id: number | null;
    message: string;
    created_at: string;
}

export default function SessionShow({ session }: Props) {
    const [assignAgentId, setAssignAgentId] = useState('');
    const [liveMessages, setLiveMessages] = useState<Message[]>(
        session.messages
    );
    const bottomRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, reset } = useForm({ message: '' });

    useEchoPrivateChannel(
        `chat-session.${session.id}`,
        '.NewChatMessage',
        payload => {
            const msg = payload as BroadcastMessage;
            setLiveMessages(prev => [
                ...prev,
                {
                    id: msg.id,
                    sender_type: msg.sender_type,
                    agent: null,
                    message: msg.message,
                    is_read: false,
                    created_at: msg.created_at,
                },
            ]);
        }
    );

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [liveMessages]);

    const unreadCount = liveMessages.filter(
        m => !m.is_read && m.sender_type === 'visitor'
    ).length;

    function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        post(`/live-chat/sessions/${session.id}/messages`, {
            onSuccess: () => reset(),
        });
    }

    function resolve() {
        router.post(`/live-chat/sessions/${session.id}/resolve`);
    }

    function assignAgent(e: React.FormEvent) {
        e.preventDefault();
        if (!assignAgentId) return;
        router.post(`/live-chat/sessions/${session.id}/assign`, {
            agent_id: assignAgentId,
        });
    }

    return (
        <AppLayout>
            <Head title={`Session #${session.id}`} />
            <div className="flex h-[calc(100vh-120px)] gap-4">
                {/* Left panel: Session info */}
                <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            Session Info
                        </h2>

                        <dl className="space-y-2 text-sm">
                            <div>
                                <dt className="text-xs text-slate-500">
                                    Visitor
                                </dt>
                                <dd className="font-medium text-slate-900">
                                    {session.visitor_name ?? 'Anonymous'}
                                </dd>
                            </div>
                            {session.visitor_email && (
                                <div>
                                    <dt className="text-xs text-slate-500">
                                        Email
                                    </dt>
                                    <dd className="text-slate-700">
                                        {session.visitor_email}
                                    </dd>
                                </div>
                            )}
                            {session.source_url && (
                                <div>
                                    <dt className="text-xs text-slate-500">
                                        Source URL
                                    </dt>
                                    <dd className="text-slate-700 break-all text-xs">
                                        {session.source_url}
                                    </dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-xs text-slate-500">
                                    Channel
                                </dt>
                                <dd className="text-slate-700">
                                    {session.channel?.name ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">
                                    Status
                                </dt>
                                <dd>
                                    <span
                                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${
                                            statusColors[session.status] ?? ''
                                        }`}
                                    >
                                        {session.status}
                                    </span>
                                    {unreadCount > 0 && (
                                        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">
                                    Assigned Agent
                                </dt>
                                <dd className="text-slate-700">
                                    {session.agent?.name ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">
                                    Rating
                                </dt>
                                <dd>
                                    <StarDisplay rating={session.rating} />
                                </dd>
                            </div>
                            {session.started_at && (
                                <div>
                                    <dt className="text-xs text-slate-500">
                                        Started
                                    </dt>
                                    <dd className="text-xs text-slate-700">
                                        {formatTime(session.started_at)}
                                    </dd>
                                </div>
                            )}
                            {session.ended_at && (
                                <div>
                                    <dt className="text-xs text-slate-500">
                                        Ended
                                    </dt>
                                    <dd className="text-xs text-slate-700">
                                        {formatTime(session.ended_at)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Actions */}
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            Actions
                        </h2>

                        <form onSubmit={assignAgent} className="space-y-2">
                            <label className="block text-xs font-medium text-slate-600">
                                Assign to Agent
                            </label>
                            <input
                                type="number"
                                placeholder="Agent ID"
                                value={assignAgentId}
                                onChange={e => setAssignAgentId(e.target.value)}
                                className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Assign
                            </button>
                        </form>

                        {session.status !== 'resolved' && (
                            <button
                                onClick={resolve}
                                className="w-full rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                            >
                                Resolve Session
                            </button>
                        )}
                    </div>
                </div>

                {/* Right panel: Messages */}
                <div className="flex flex-1 flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <h2 className="text-sm font-semibold text-slate-700">
                            Conversation
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {liveMessages.length === 0 && (
                            <p className="text-center text-sm text-slate-400 py-8">
                                No messages yet.
                            </p>
                        )}
                        {liveMessages.map(msg => {
                            if (msg.sender_type === 'bot') {
                                return (
                                    <div
                                        key={msg.id}
                                        className="flex justify-center"
                                    >
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                                            {msg.message}
                                        </span>
                                    </div>
                                );
                            }

                            const isAgent = msg.sender_type === 'agent';
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${
                                        isAgent
                                            ? 'justify-end'
                                            : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                                            isAgent
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-800'
                                        }`}
                                    >
                                        {isAgent && msg.agent && (
                                            <p className="mb-1 text-xs font-medium text-indigo-200">
                                                {msg.agent.name}
                                            </p>
                                        )}
                                        <p>{msg.message}</p>
                                        <p
                                            className={`mt-1 text-xs ${
                                                isAgent
                                                    ? 'text-indigo-200'
                                                    : 'text-slate-400'
                                            }`}
                                        >
                                            {formatTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Send message form */}
                    <div className="border-t border-slate-200 p-3">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={data.message}
                                onChange={e =>
                                    setData('message', e.target.value)
                                }
                                placeholder="Type a message..."
                                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={processing || !data.message.trim()}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

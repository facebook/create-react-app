import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { Button } from '@/Components/Common/Button';

interface Channel {
    id: number;
    name: string;
    type: string;
    description: string | null;
    messages_count: number;
    unread_count: number;
    created_by: string | null;
}

interface Props {
    channels: Channel[];
}

export default function DiscussIndex({ channels }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', type: 'public' });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        router.post('/discuss', form, { onSuccess: () => setShowCreate(false) });
    }

    return (
        <AppLayout>
            <Head title="Discuss" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">Discuss</h1>
                    <Button onClick={() => setShowCreate(true)}>+ New Channel</Button>
                </div>

                {showCreate && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-800">Create Channel</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Name</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. general"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Description</label>
                                <input
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Optional description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Type</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Create</Button>
                                <button type="button" onClick={() => setShowCreate(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
                    {channels.map(ch => (
                        <div key={ch.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-sm">#</span>
                                    <Link href={`/discuss/${ch.id}`} className="text-sm font-medium text-slate-800 hover:text-blue-600 truncate">
                                        {ch.name}
                                    </Link>
                                    {ch.type === 'private' && (
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">private</span>
                                    )}
                                    {ch.unread_count > 0 && (
                                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                                            {ch.unread_count}
                                        </span>
                                    )}
                                </div>
                                {ch.description && (
                                    <p className="mt-0.5 text-xs text-slate-500 truncate">{ch.description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span>{ch.messages_count} messages</span>
                                <Link href={`/discuss/${ch.id}`} className="rounded-md border border-slate-300 px-3 py-1 text-slate-600 hover:bg-slate-50">
                                    Open
                                </Link>
                            </div>
                        </div>
                    ))}
                    {channels.length === 0 && (
                        <p className="py-8 text-center text-sm text-slate-500">No channels yet. Create one to start chatting.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

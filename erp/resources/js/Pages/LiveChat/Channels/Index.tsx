import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface Channel {
    id: number;
    name: string;
    widget_color: string;
    is_active: boolean;
    sessions_count: number;
    welcome_message: string | null;
    offline_message: string | null;
}

interface Props extends PageProps {
    channels: Channel[];
}

export default function ChannelsIndex({ channels }: Props) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        widget_color: '#875A7B',
        welcome_message: '',
        offline_message: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/live-chat/channels', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    return (
        <AppLayout>
            <Head title="Chat Channels" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Chat Channels</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        {showForm ? 'Cancel' : 'New Channel'}
                    </button>
                </div>

                {showForm && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-800">Create Channel</h2>
                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Channel Name *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Widget Color</label>
                                <input
                                    type="color"
                                    value={data.widget_color}
                                    onChange={e => setData('widget_color', e.target.value)}
                                    className="mt-1 block h-9 w-full rounded-md border border-slate-300 px-1 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Welcome Message</label>
                                <textarea
                                    value={data.welcome_message}
                                    onChange={e => setData('welcome_message', e.target.value)}
                                    rows={2}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="Hi! How can we help you?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Offline Message</label>
                                <textarea
                                    value={data.offline_message}
                                    onChange={e => setData('offline_message', e.target.value)}
                                    rows={2}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="We're offline right now. Leave a message!"
                                />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { reset(); setShowForm(false); }}
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Channel'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Widget Color</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Sessions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {channels.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                                            No channels yet. Create your first channel above.
                                        </td>
                                    </tr>
                                )}
                                {channels.map((channel) => (
                                    <tr key={channel.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{channel.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${channel.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {channel.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="inline-block h-5 w-5 rounded-full border border-slate-200"
                                                    style={{ backgroundColor: channel.widget_color }}
                                                />
                                                <span className="text-xs text-slate-500">{channel.widget_color}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{channel.sessions_count}</td>
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

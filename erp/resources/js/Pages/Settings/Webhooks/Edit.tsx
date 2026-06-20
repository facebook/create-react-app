import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Webhook {
    id: number;
    name: string;
    url: string;
    events: string[];
    secret: string | null;
    is_active: boolean;
}

interface Props extends PageProps {
    webhook: Webhook;
    availableEvents: string[];
}

export default function WebhookEdit({ webhook, availableEvents }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name:      webhook.name,
        url:       webhook.url,
        secret:    webhook.secret ?? '',
        events:    webhook.events ?? [],
        is_active: webhook.is_active,
    });

    function toggleEvent(ev: string) {
        setData('events',
            data.events.includes(ev)
                ? data.events.filter((e) => e !== ev)
                : [...data.events, ev]
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/settings/webhooks/${webhook.id}`);
    }

    return (
        <AppLayout>
            <Head title="Edit Webhook" />
            <div className="max-w-xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Webhook</h1>
                    <p className="mt-1 text-sm text-slate-500">Update your webhook configuration.</p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Payload URL</label>
                        <input
                            type="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        {errors.url && <p className="mt-1 text-xs text-red-600">{errors.url}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Secret <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={data.secret}
                            onChange={(e) => setData('secret', e.target.value)}
                            placeholder="Leave blank to keep existing secret"
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Events</label>
                        <div className="space-y-2">
                            {availableEvents.map((ev) => (
                                <label key={ev} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.events.includes(ev)}
                                        onChange={() => toggleEvent(ev)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-slate-700">{ev}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-slate-700">Active</span>
                        </label>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" variant="primary" disabled={processing} loading={processing}>
                            Update Webhook
                        </Button>
                        <a href="/settings/webhooks">
                            <Button type="button" variant="secondary">Cancel</Button>
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

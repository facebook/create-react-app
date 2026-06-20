import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Webhook {
    id: number;
    name: string;
    url: string;
    events: string[];
    is_active: boolean;
    deliveries_count: number;
    created_at: string;
}

interface Props extends PageProps {
    webhooks: Webhook[];
    availableEvents: string[];
}

export default function WebhooksIndex({ webhooks }: Props) {
    function destroy(id: number) {
        if (!confirm('Delete this webhook?')) return;
        router.delete(`/settings/webhooks/${id}`);
    }

    function sendTest(id: number) {
        router.post(`/settings/webhooks/${id}/test`);
    }

    return (
        <AppLayout>
            <Head title="Webhooks" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Webhooks</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Receive HTTP notifications when events occur in your ERP.
                        </p>
                    </div>
                    <Link href="/settings/webhooks/create">
                        <Button variant="primary">Add Webhook</Button>
                    </Link>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Name / URL</th>
                                <th className="px-4 py-3 text-left font-medium">Events</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Deliveries</th>
                                <th className="px-4 py-3 text-left font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {webhooks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No webhooks configured.{' '}
                                        <Link href="/settings/webhooks/create" className="text-indigo-600 hover:underline">
                                            Add one
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                webhooks.map((webhook) => (
                                    <tr key={webhook.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900">{webhook.name}</p>
                                            <p className="text-xs text-slate-400 truncate max-w-xs" title={webhook.url}>
                                                {webhook.url}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {(webhook.events ?? []).map((ev) => (
                                                    <span key={ev} className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                                        {ev}
                                                    </span>
                                                ))}
                                                {(webhook.events ?? []).length === 0 && (
                                                    <span className="text-xs text-slate-400">No events</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                webhook.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {webhook.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            <Link
                                                href={`/settings/webhooks/${webhook.id}/deliveries`}
                                                className="text-indigo-600 hover:underline text-xs"
                                            >
                                                {webhook.deliveries_count} deliveries
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => sendTest(webhook.id)}
                                                    className="text-xs text-slate-600 hover:text-indigo-700 underline"
                                                >
                                                    Test
                                                </button>
                                                <Link
                                                    href={`/settings/webhooks/${webhook.id}/edit`}
                                                    className="text-xs text-indigo-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => destroy(webhook.id)}
                                                    className="text-xs text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

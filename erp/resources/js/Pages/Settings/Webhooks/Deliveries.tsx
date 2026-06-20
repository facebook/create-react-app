import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Delivery {
    id: number;
    event: string;
    response_status: number | null;
    response_body: string | null;
    delivered_at: string | null;
    failed_at: string | null;
    attempts: number;
    created_at: string;
}

interface Webhook {
    id: number;
    name: string;
    url: string;
}

interface Props extends PageProps {
    webhook: Webhook;
    deliveries: Delivery[];
}

function StatusBadge({ status }: { status: number | null }) {
    if (!status) {
        return (
            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                Failed
            </span>
        );
    }
    const isSuccess = status >= 200 && status < 300;
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
            {status}
        </span>
    );
}

export default function WebhookDeliveries({ webhook, deliveries }: Props) {
    return (
        <AppLayout>
            <Head title={`Deliveries — ${webhook.name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/settings/webhooks" className="text-sm text-indigo-600 hover:underline">
                        &larr; Back to Webhooks
                    </Link>
                </div>

                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Deliveries — {webhook.name}</h1>
                    <p className="mt-1 text-sm text-slate-500 truncate max-w-md">{webhook.url}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Event</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Response Preview</th>
                                <th className="px-4 py-3 text-left font-medium">Delivered At</th>
                                <th className="px-4 py-3 text-left font-medium">Attempts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {deliveries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No deliveries yet.
                                    </td>
                                </tr>
                            ) : (
                                deliveries.map((delivery) => (
                                    <tr key={delivery.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                                {delivery.event}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={delivery.response_status} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-xs text-slate-500 truncate max-w-xs" title={delivery.response_body ?? ''}>
                                                {delivery.response_body
                                                    ? delivery.response_body.substring(0, 80)
                                                    : delivery.failed_at
                                                        ? <span className="text-red-500">Delivery failed</span>
                                                        : '—'
                                                }
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {delivery.delivered_at
                                                ? new Date(delivery.delivered_at).toLocaleString()
                                                : delivery.failed_at
                                                    ? <span className="text-red-500">Failed {new Date(delivery.failed_at).toLocaleString()}</span>
                                                    : '—'
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 text-center">
                                            {delivery.attempts}
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

import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import { useRef } from 'react';

interface Subscriber {
    id: number;
    email: string;
    name: string | null;
    status: string;
    mailing_lists_count: number;
    subscribed_at: string | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    status?: string;
    search?: string;
}

interface Props extends PageProps {
    subscribers: Paginated<Subscriber>;
    filters: Filters;
}

const statusBadge: Record<string, string> = {
    subscribed:   'bg-green-100 text-green-700',
    unsubscribed: 'bg-slate-100 text-slate-600',
    bounced:      'bg-red-100 text-red-700',
};

export default function SubscribersIndex({ subscribers, filters }: Props) {
    const { post: unsubscribePost, processing: unsubscribing } = useForm();
    const { delete: destroy, processing: deleting } = useForm();
    const fileRef = useRef<HTMLInputElement>(null);

    function handleUnsubscribe(id: number) {
        if (!confirm('Unsubscribe this subscriber?')) return;
        unsubscribePost(`/marketing/subscribers/${id}/unsubscribe`);
    }

    function handleDelete(id: number) {
        if (!confirm('Delete subscriber?')) return;
        destroy(`/marketing/subscribers/${id}`);
    }

    function handleFilter(key: string, value: string) {
        router.get('/marketing/subscribers', { ...filters, [key]: value }, { preserveState: true });
    }

    function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        router.post('/marketing/subscribers/import', formData as unknown as Record<string, unknown>);
    }

    return (
        <AppLayout>
            <Head title="Subscribers" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Subscribers</h1>
                        <p className="mt-1 text-sm text-slate-500">{subscribers.total} total</p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                            Import CSV
                        </Button>
                        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleImport} />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.status ?? ''}
                        onChange={e => handleFilter('status', e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    >
                        <option value="">All statuses</option>
                        <option value="subscribed">Subscribed</option>
                        <option value="unsubscribed">Unsubscribed</option>
                        <option value="bounced">Bounced</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={filters.search ?? ''}
                        onChange={e => handleFilter('search', e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Lists</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Subscribed At</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {subscribers.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No subscribers found.</td>
                                </tr>
                            )}
                            {subscribers.data.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{sub.email}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{sub.name ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusBadge[sub.status] ?? statusBadge.subscribed}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-700">{sub.mailing_lists_count}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{sub.subscribed_at ?? '—'}</td>
                                    <td className="px-4 py-3 text-right space-x-3">
                                        {sub.status === 'subscribed' && (
                                            <button
                                                onClick={() => handleUnsubscribe(sub.id)}
                                                disabled={unsubscribing}
                                                className="text-xs text-yellow-600 hover:text-yellow-800"
                                            >
                                                Unsubscribe
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            disabled={deleting}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

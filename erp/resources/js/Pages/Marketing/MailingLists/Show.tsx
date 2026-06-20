import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface MailingList {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
}

interface Subscriber {
    id: number;
    email: string;
    name: string | null;
    status: string;
    subscribed_at: string | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    list: MailingList;
    subscribers: Paginated<Subscriber>;
}

interface AddFormData {
    email: string;
    name: string;
    [key: string]: string;
}

const statusBadge: Record<string, string> = {
    subscribed:   'bg-green-100 text-green-700',
    unsubscribed: 'bg-slate-100 text-slate-600',
    bounced:      'bg-red-100 text-red-700',
};

export default function MailingListShow({ list, subscribers }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<AddFormData>({
        email: '',
        name:  '',
    });

    const { delete: destroy, processing: removing } = useForm();

    function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        post(`/marketing/mailing-lists/${list.id}/add-subscriber`, {
            onSuccess: () => reset(),
        });
    }

    function handleRemove(subscriberId: number) {
        if (!confirm('Remove subscriber from list?')) return;
        destroy(`/marketing/mailing-lists/${list.id}/subscribers/${subscriberId}`);
    }

    return (
        <AppLayout>
            <Head title={list.name} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{list.name}</h1>
                        <p className="mt-1 text-sm text-slate-500">{subscribers.total} subscribers</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/marketing/mailing-lists/${list.id}/edit`}>
                            <Button variant="secondary">Edit</Button>
                        </Link>
                        <Link href="/marketing/mailing-lists" className="text-sm text-slate-500 hover:text-slate-700 self-center">Back</Link>
                    </div>
                </div>

                {/* Add subscriber form */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-800 mb-4">Add Subscriber</h2>
                    <form onSubmit={handleAdd} className="flex items-start gap-3">
                        <div className="flex-1">
                            <input
                                type="email"
                                placeholder="Email address"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Name (optional)"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <Button type="submit" disabled={processing}>Add</Button>
                    </form>
                </div>

                {/* Subscribers table */}
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Subscribers</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Subscribed At</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {subscribers.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No subscribers yet.</td>
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
                                    <td className="px-4 py-3 text-sm text-slate-600">{sub.subscribed_at ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleRemove(sub.id)}
                                            disabled={removing}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Remove
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

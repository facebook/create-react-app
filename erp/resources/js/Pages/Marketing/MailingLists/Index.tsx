import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface MailingList {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    subscribers_count: number;
    created_at: string;
}

interface Props extends PageProps {
    lists: MailingList[];
}

export default function MailingListsIndex({ lists }: Props) {
    const { delete: destroy, processing } = useForm();

    function handleDelete(id: number) {
        if (!confirm('Delete this mailing list?')) return;
        destroy(`/marketing/mailing-lists/${id}`);
    }

    return (
        <AppLayout>
            <Head title="Mailing Lists" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Mailing Lists</h1>
                        <p className="mt-1 text-sm text-slate-500">{lists.length} lists</p>
                    </div>
                    <Link href="/marketing/mailing-lists/create"><Button>New List</Button></Link>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Subscribers</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {lists.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No mailing lists yet.</td>
                                </tr>
                            )}
                            {lists.map((list) => (
                                <tr key={list.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <Link href={`/marketing/mailing-lists/${list.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                            {list.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{list.description ?? '—'}</td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-700">{list.subscribers_count}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${list.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {list.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-3">
                                        <Link href={`/marketing/mailing-lists/${list.id}/edit`} className="text-xs text-indigo-600 hover:text-indigo-800">Edit</Link>
                                        <button
                                            onClick={() => handleDelete(list.id)}
                                            disabled={processing}
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

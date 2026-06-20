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

interface FormData {
    name: string;
    description: string;
    is_active: boolean;
    [key: string]: string | boolean;
}

interface Props extends PageProps {
    list: MailingList;
}

export default function MailingListEdit({ list }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        name:        list.name,
        description: list.description ?? '',
        is_active:   list.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/marketing/mailing-lists/${list.id}`);
    }

    return (
        <AppLayout>
            <Head title="Edit Mailing List" />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Mailing List</h1>
                    <Link href="/marketing/mailing-lists" className="text-sm text-slate-500 hover:text-slate-700">Back</Link>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="is_active"
                            type="checkbox"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                        <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href="/marketing/mailing-lists">
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

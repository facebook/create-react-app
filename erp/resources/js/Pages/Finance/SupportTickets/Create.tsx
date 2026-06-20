import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Contact {
    id: number;
    name: string;
}

interface Props extends PageProps {
    contacts: Contact[];
}

export default function SupportTicketsCreate({ contacts }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        subject:     '',
        description: '',
        priority:    'normal' as string,
        category:    '',
        contact_id:  '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/support-tickets');
    }

    const inputClass = 'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <AppLayout>
            <Head title="New Support Ticket" />
            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">New Support Ticket</h1>
                    <Link href="/finance/support-tickets">
                        <Button variant="secondary">Cancel</Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Subject *</label>
                        <input
                            type="text"
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            className={inputClass}
                        />
                        {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description *</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={5}
                            className={inputClass}
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Priority</label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className={inputClass}
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                            {errors.priority && <p className="mt-1 text-xs text-red-600">{errors.priority}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Category</label>
                            <input
                                type="text"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                placeholder="e.g. billing, technical, general"
                                className={inputClass}
                            />
                            {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Contact (optional)</label>
                        <select
                            value={data.contact_id}
                            onChange={(e) => setData('contact_id', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">— No Contact —</option>
                            {contacts.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.contact_id && <p className="mt-1 text-xs text-red-600">{errors.contact_id}</p>}
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={processing}>Create Ticket</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

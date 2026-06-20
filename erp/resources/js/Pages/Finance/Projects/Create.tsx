import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Contact } from '@/types/finance';

interface Props extends PageProps {
    contacts: Contact[];
}

export default function ProjectCreate({ contacts }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name:         '',
        description:  '',
        contact_id:   '',
        billing_type: 'non_billable' as 'fixed' | 'hourly' | 'non_billable',
        budget:       '',
        hourly_rate:  '',
        start_date:   '',
        end_date:     '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/projects');
    }

    return (
        <AppLayout>
            <Head title="New Project" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">New Project</h1>
                    <Link href="/finance/projects"><Button variant="secondary">Back</Button></Link>
                </div>
                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                            <select
                                value={data.contact_id}
                                onChange={(e) => setData('contact_id', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="">None</option>
                                {contacts.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Billing Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.billing_type}
                                onChange={(e) => setData('billing_type', e.target.value as typeof data.billing_type)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="non_billable">Non-Billable</option>
                                <option value="fixed">Fixed Price</option>
                                <option value="hourly">Hourly</option>
                            </select>
                            {errors.billing_type && <p className="mt-1 text-xs text-red-500">{errors.billing_type}</p>}
                        </div>

                        {data.billing_type !== 'non_billable' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Budget</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={data.budget}
                                    onChange={(e) => setData('budget', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.budget && <p className="mt-1 text-xs text-red-500">{errors.budget}</p>}
                            </div>
                        )}

                        {data.billing_type === 'hourly' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={data.hourly_rate}
                                    onChange={(e) => setData('hourly_rate', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.hourly_rate && <p className="mt-1 text-xs text-red-500">{errors.hourly_rate}</p>}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href="/finance/projects"><Button type="button" variant="secondary">Cancel</Button></Link>
                        <Button type="submit" disabled={processing}>Create Project</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

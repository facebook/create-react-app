import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
}

interface Props extends PageProps {
    users: User[];
}

export default function LeadsCreate({ users }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'other' as string,
        stage: 'new' as string,
        estimated_value: '',
        probability: '0',
        assigned_to: '',
        expected_close_date: '',
        notes: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/leads');
    }

    const inputClass = 'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <AppLayout>
            <Head title="New Lead" />
            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">New Lead</h1>
                    <Link href="/finance/leads">
                        <Button variant="secondary">Cancel</Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Name *</label>
                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClass} />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Phone</label>
                            <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={inputClass} />
                            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Company</label>
                        <input type="text" value={data.company} onChange={(e) => setData('company', e.target.value)} className={inputClass} />
                        {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Source *</label>
                            <select value={data.source} onChange={(e) => setData('source', e.target.value)} className={inputClass}>
                                <option value="website">Website</option>
                                <option value="referral">Referral</option>
                                <option value="cold_call">Cold Call</option>
                                <option value="trade_show">Trade Show</option>
                                <option value="social_media">Social Media</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.source && <p className="mt-1 text-xs text-red-600">{errors.source}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Stage</label>
                            <select value={data.stage} onChange={(e) => setData('stage', e.target.value)} className={inputClass}>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="proposal">Proposal</option>
                                <option value="negotiation">Negotiation</option>
                                <option value="won">Won</option>
                                <option value="lost">Lost</option>
                            </select>
                            {errors.stage && <p className="mt-1 text-xs text-red-600">{errors.stage}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Estimated Value</label>
                            <input type="number" step="0.01" min="0" value={data.estimated_value} onChange={(e) => setData('estimated_value', e.target.value)} className={inputClass} />
                            {errors.estimated_value && <p className="mt-1 text-xs text-red-600">{errors.estimated_value}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Probability (0-100)</label>
                            <input type="number" min="0" max="100" value={data.probability} onChange={(e) => setData('probability', e.target.value)} className={inputClass} />
                            {errors.probability && <p className="mt-1 text-xs text-red-600">{errors.probability}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Assigned To</label>
                            <select value={data.assigned_to} onChange={(e) => setData('assigned_to', e.target.value)} className={inputClass}>
                                <option value="">— Unassigned —</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            {errors.assigned_to && <p className="mt-1 text-xs text-red-600">{errors.assigned_to}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Expected Close Date</label>
                            <input type="date" value={data.expected_close_date} onChange={(e) => setData('expected_close_date', e.target.value)} className={inputClass} />
                            {errors.expected_close_date && <p className="mt-1 text-xs text-red-600">{errors.expected_close_date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={4} className={inputClass} />
                        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={processing}>Create Lead</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

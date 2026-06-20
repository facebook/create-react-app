import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Contact, SubscriptionPlan } from '@/types/finance';

interface Props extends PageProps {
    contacts: Pick<Contact, 'id' | 'name'>[];
    plans: Pick<SubscriptionPlan, 'id' | 'name' | 'billing_cycle' | 'price'>[];
}

export default function SubscriptionCreate({ contacts, plans }: Props) {
    const [form, setForm] = useState({
        contact_id: '' as number | '',
        subscription_plan_id: '' as number | '',
        started_at: new Date().toISOString().slice(0, 10),
        notes: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/finance/subscriptions', form, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AppLayout>
            <Head title="New Subscription" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Subscription</h1>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Contact *</label>
                        <select
                            value={form.contact_id}
                            onChange={(e) => setForm({ ...form, contact_id: e.target.value ? Number(e.target.value) : '' })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            required
                        >
                            <option value="">Select contact…</option>
                            {contacts.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.contact_id && <p className="mt-1 text-xs text-red-600">{errors.contact_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Subscription Plan *</label>
                        <select
                            value={form.subscription_plan_id}
                            onChange={(e) => setForm({ ...form, subscription_plan_id: e.target.value ? Number(e.target.value) : '' })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            required
                        >
                            <option value="">Select plan…</option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>{p.name} — {p.billing_cycle} @ {Number(p.price).toFixed(2)}</option>
                            ))}
                        </select>
                        {errors.subscription_plan_id && <p className="mt-1 text-xs text-red-600">{errors.subscription_plan_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Start Date *</label>
                        <input
                            type="date"
                            value={form.started_at}
                            onChange={(e) => setForm({ ...form, started_at: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            required
                        />
                        {errors.started_at && <p className="mt-1 text-xs text-red-600">{errors.started_at}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea
                            rows={3}
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <a href="/finance/subscriptions" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </a>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Create Subscription'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

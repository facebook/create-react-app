import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface SubscriptionPlan {
    id: number;
    name: string;
    description: string | null;
    billing_cycle: 'monthly' | 'quarterly' | 'annual';
    price: string;
    trial_days: number;
    is_active: boolean;
}

interface Props extends PageProps {
    plans: SubscriptionPlan[];
}

const CYCLE_LABELS: Record<string, string> = {
    monthly:   'Monthly',
    quarterly: 'Quarterly',
    annual:    'Annual',
};

const CYCLE_MONTHS: Record<string, number> = {
    monthly:   1,
    quarterly: 3,
    annual:    12,
};

function monthlyEquiv(plan: SubscriptionPlan): number {
    const months = CYCLE_MONTHS[plan.billing_cycle] ?? 1;
    return parseFloat(plan.price) / months;
}

export default function SubscriptionPlans({ plans }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        billing_cycle: 'monthly',
        price: '',
        trial_days: '0',
        description: '',
        is_active: true,
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        router.post(
            '/subscriptions/plans',
            { ...form, price: parseFloat(form.price), trial_days: parseInt(form.trial_days) },
            {
                onSuccess: () => {
                    setShowForm(false);
                    setForm({ name: '', billing_cycle: 'monthly', price: '', trial_days: '0', description: '', is_active: true });
                },
            },
        );
    }

    const inputClass =
        'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

    return (
        <AppLayout>
            <Head title="Subscription Plans" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">
                            <Link href="/subscriptions" className="text-indigo-600 hover:underline">
                                Subscriptions
                            </Link>{' '}
                            &rsaquo; Plans
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-800">Subscription Plans</h1>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Plan'}
                    </Button>
                </div>

                {/* Create form */}
                {showForm && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-800">New Plan</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        Billing Cycle <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.billing_cycle}
                                        onChange={(e) => setForm((f) => ({ ...f, billing_cycle: e.target.value }))}
                                        className={inputClass}
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="annual">Annual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.price}
                                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Trial Days</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.trial_days}
                                        onChange={(e) => setForm((f) => ({ ...f, trial_days: e.target.value }))}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                        className={inputClass}
                                        rows={2}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="flex items-center gap-2 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit">Create Plan</Button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Plan cards */}
                {plans.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <p className="text-slate-400">No plans yet. Create one above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`rounded-lg border bg-white p-6 shadow-sm ${plan.is_active ? 'border-indigo-200' : 'border-slate-200 opacity-60'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                                    <span
                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {plan.description && (
                                    <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                                )}

                                <div className="mt-4">
                                    <p className="text-3xl font-bold text-slate-900">
                                        ${parseFloat(plan.price).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        per {plan.billing_cycle} &mdash; {CYCLE_LABELS[plan.billing_cycle]}
                                    </p>
                                </div>

                                <div className="mt-4 space-y-1 text-sm text-slate-600">
                                    <div className="flex items-center justify-between">
                                        <span>Monthly equivalent</span>
                                        <span className="font-medium">${monthlyEquiv(plan).toFixed(2)}/mo</span>
                                    </div>
                                    {plan.trial_days > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span>Free trial</span>
                                            <span className="font-medium">{plan.trial_days} days</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

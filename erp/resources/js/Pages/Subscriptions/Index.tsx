import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { Button } from '@/Components/Common/Button';

interface SubscriptionPlan {
    id: number;
    name: string;
    billing_cycle: 'monthly' | 'quarterly' | 'annual';
    price: string;
    trial_days: number;
    description: string | null;
    is_active: boolean;
}

interface Subscription {
    id: number;
    customer_name: string;
    customer_email: string;
    status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
    current_period_start: string;
    current_period_end: string;
    plan: SubscriptionPlan | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedSubscriptions {
    data: Subscription[];
    links: PaginationLink[];
    total: number;
}

interface Props {
    subscriptions: PaginatedSubscriptions;
    plans: SubscriptionPlan[];
    mrr: number;
    filters: {
        status?: string;
        plan_id?: string;
    };
}

const STATUS_BADGES: Record<string, string> = {
    trial:    'bg-purple-100 text-purple-700',
    active:   'bg-green-100 text-green-700',
    past_due: 'bg-orange-100 text-orange-700',
    cancelled:'bg-red-100 text-red-700',
    expired:  'bg-gray-100 text-gray-700',
};

const CYCLE_LABELS: Record<string, string> = {
    monthly:   'Monthly',
    quarterly: 'Quarterly',
    annual:    'Annual',
};

function monthlyEquiv(plan: SubscriptionPlan): number {
    const months = plan.billing_cycle === 'monthly' ? 1 : plan.billing_cycle === 'quarterly' ? 3 : 12;
    return parseFloat(plan.price) / months;
}

export default function SubscriptionsIndex({ subscriptions, plans, mrr, filters }: Props) {
    const [activeTab, setActiveTab] = useState<'subscriptions' | 'plans'>('subscriptions');
    const [showNewSub, setShowNewSub] = useState(false);
    const [showNewPlan, setShowNewPlan] = useState(false);

    const [subForm, setSubForm] = useState({
        customer_name: '',
        customer_email: '',
        plan_id: '',
    });
    const [planForm, setPlanForm] = useState({
        name: '',
        billing_cycle: 'monthly',
        price: '',
        trial_days: '0',
        description: '',
    });

    const activeCount = subscriptions.data.filter(s => s.status === 'active').length;
    const trialCount  = subscriptions.data.filter(s => s.status === 'trial').length;

    function handleCreateSub(e: React.FormEvent) {
        e.preventDefault();
        router.post('/subscriptions', { ...subForm, plan_id: parseInt(subForm.plan_id) }, {
            onSuccess: () => {
                setShowNewSub(false);
                setSubForm({ customer_name: '', customer_email: '', plan_id: '' });
            },
        });
    }

    function handleCreatePlan(e: React.FormEvent) {
        e.preventDefault();
        router.post('/subscriptions/plans', { ...planForm, price: parseFloat(planForm.price), trial_days: parseInt(planForm.trial_days) }, {
            onSuccess: () => {
                setShowNewPlan(false);
                setPlanForm({ name: '', billing_cycle: 'monthly', price: '', trial_days: '0', description: '' });
            },
        });
    }

    function handleCancel(id: number) {
        if (confirm('Cancel this subscription?')) {
            router.post(`/subscriptions/${id}/cancel`);
        }
    }

    return (
        <AppLayout>
            <Head title="Subscriptions" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">Subscriptions</h1>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Monthly Recurring Revenue</p>
                        <p className="mt-1 text-2xl font-bold text-slate-800">${mrr.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Active Subscriptions</p>
                        <p className="mt-1 text-2xl font-bold text-green-600">{activeCount}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Trial Subscriptions</p>
                        <p className="mt-1 text-2xl font-bold text-purple-600">{trialCount}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'subscriptions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-600 hover:text-slate-800'}`}
                    >
                        Subscriptions
                    </button>
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'plans' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-600 hover:text-slate-800'}`}
                    >
                        Plans
                    </button>
                </div>

                {activeTab === 'subscriptions' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setShowNewSub(true)}>+ New Subscription</Button>
                        </div>

                        {showNewSub && (
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-base font-semibold text-slate-800">New Subscription</h2>
                                <form onSubmit={handleCreateSub} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Customer Name</label>
                                        <input
                                            value={subForm.customer_name}
                                            onChange={e => setSubForm(f => ({ ...f, customer_name: e.target.value }))}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Customer Email</label>
                                        <input
                                            type="email"
                                            value={subForm.customer_email}
                                            onChange={e => setSubForm(f => ({ ...f, customer_email: e.target.value }))}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Plan</label>
                                        <select
                                            value={subForm.plan_id}
                                            onChange={e => setSubForm(f => ({ ...f, plan_id: e.target.value }))}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select a plan</option>
                                            {plans.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} - ${p.price}/{p.billing_cycle}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit">Create</Button>
                                        <button type="button" onClick={() => setShowNewSub(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Plan</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Renewal</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">MRR</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {subscriptions.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-6 text-center text-slate-400">No subscriptions found.</td>
                                        </tr>
                                    ) : (
                                        subscriptions.data.map(sub => (
                                            <tr key={sub.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <a href={`/subscriptions/${sub.id}`} className="font-medium text-blue-600 hover:underline">
                                                        {sub.customer_name}
                                                    </a>
                                                    <div className="text-xs text-slate-500">{sub.customer_email}</div>
                                                </td>
                                                <td className="px-4 py-3">{sub.plan?.name ?? '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[sub.status] ?? ''}`}>
                                                        {sub.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{sub.current_period_end}</td>
                                                <td className="px-4 py-3">
                                                    {['active', 'trial'].includes(sub.status) && sub.plan
                                                        ? `$${monthlyEquiv(sub.plan).toFixed(2)}`
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {['active', 'trial'].includes(sub.status) && (
                                                        <button
                                                            onClick={() => handleCancel(sub.id)}
                                                            className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'plans' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setShowNewPlan(true)}>+ New Plan</Button>
                        </div>

                        {showNewPlan && (
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-base font-semibold text-slate-800">New Plan</h2>
                                <form onSubmit={handleCreatePlan} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Name</label>
                                        <input
                                            value={planForm.name}
                                            onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Billing Cycle</label>
                                        <select
                                            value={planForm.billing_cycle}
                                            onChange={e => setPlanForm(f => ({ ...f, billing_cycle: e.target.value }))}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="annual">Annual</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={planForm.price}
                                            onChange={e => setPlanForm(f => ({ ...f, price: e.target.value }))}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Trial Days</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={planForm.trial_days}
                                            onChange={e => setPlanForm(f => ({ ...f, trial_days: e.target.value }))}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Description</label>
                                        <textarea
                                            value={planForm.description}
                                            onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit">Create Plan</Button>
                                        <button type="button" onClick={() => setShowNewPlan(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Cycle</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Price</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Monthly Equiv.</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Active</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {plans.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No plans yet.</td>
                                        </tr>
                                    ) : (
                                        plans.map(plan => (
                                            <tr key={plan.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-800">{plan.name}</td>
                                                <td className="px-4 py-3">{CYCLE_LABELS[plan.billing_cycle]}</td>
                                                <td className="px-4 py-3">${plan.price}</td>
                                                <td className="px-4 py-3">${monthlyEquiv(plan).toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {plan.is_active ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

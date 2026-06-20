import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    mrr: number;
    active_count: number;
    trial_count: number;
    churn_rate: number;
}

export default function SubscriptionMetrics({ mrr, active_count, trial_count, churn_rate }: Props) {
    return (
        <AppLayout>
            <Head title="Subscription Metrics" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">Subscription Metrics</h1>
                    <Link
                        href="/subscriptions"
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        Back to Subscriptions
                    </Link>
                </div>

                {/* Key metric cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Monthly Recurring Revenue</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">${Number(mrr).toFixed(2)}</p>
                        <p className="mt-1 text-xs text-slate-400">MRR</p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Active Subscribers</p>
                        <p className="mt-2 text-3xl font-bold text-green-600">{active_count}</p>
                        <p className="mt-1 text-xs text-slate-400">active subscriptions</p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Trial Subscribers</p>
                        <p className="mt-2 text-3xl font-bold text-purple-600">{trial_count}</p>
                        <p className="mt-1 text-xs text-slate-400">in trial period</p>
                    </div>

                    <div className={`rounded-lg border p-6 shadow-sm ${churn_rate > 5 ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                        <p className="text-sm font-medium text-slate-500">Churn Rate</p>
                        <p className={`mt-2 text-3xl font-bold ${churn_rate > 5 ? 'text-red-600' : 'text-slate-900'}`}>
                            {Number(churn_rate).toFixed(2)}%
                        </p>
                        <p className="mt-1 text-xs text-slate-400">this month</p>
                    </div>
                </div>

                {/* Summary section */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700">Overview</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-sm text-slate-600">Total Active Subscribers</span>
                            <span className="text-sm font-semibold text-slate-900">
                                {active_count + trial_count}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-sm text-slate-600">Monthly Recurring Revenue</span>
                            <span className="text-sm font-semibold text-green-700">${Number(mrr).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-sm text-slate-600">Annual Run Rate (ARR)</span>
                            <span className="text-sm font-semibold text-slate-900">
                                ${(Number(mrr) * 12).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between pb-1">
                            <span className="text-sm text-slate-600">Monthly Churn Rate</span>
                            <span className={`text-sm font-semibold ${churn_rate > 5 ? 'text-red-600' : 'text-slate-900'}`}>
                                {Number(churn_rate).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick links */}
                <div className="flex gap-3">
                    <Link
                        href="/subscriptions"
                        className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        View All Subscriptions
                    </Link>
                    <Link
                        href="/subscriptions/plans"
                        className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Manage Plans
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

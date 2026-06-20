import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface EquipmentRef {
    id: number;
    name: string;
}

interface PlanItem {
    id: number;
    name: string;
    equipment: EquipmentRef | null;
    frequency: string;
    is_active: boolean;
    next_due_at: string | null;
    last_performed_at: string | null;
}

interface Props extends PageProps {
    plans: PlanItem[];
}

const frequencyLabels: Record<string, string> = {
    daily:      'Daily',
    weekly:     'Weekly',
    monthly:    'Monthly',
    quarterly:  'Quarterly',
    annual:     'Annual',
    as_needed:  'As Needed',
};

function isOverdue(dateStr: string | null): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
}

export default function PlansIndex({ plans }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        equipment_id: '',
        name: '',
        frequency: 'monthly',
        estimated_duration_hours: '',
        description: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/maintenance/plans', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    return (
        <AppLayout>
            <Head title="Maintenance Plans" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Maintenance Plans</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        {showForm ? 'Cancel' : 'New Plan'}
                    </button>
                </div>

                {showForm && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-800">New Maintenance Plan</h2>
                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Equipment ID *</label>
                                <input
                                    type="number"
                                    value={data.equipment_id}
                                    onChange={e => setData('equipment_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                                {errors.equipment_id && <p className="mt-1 text-xs text-red-600">{errors.equipment_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Plan Name *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Frequency *</label>
                                <select
                                    value={data.frequency}
                                    onChange={e => setData('frequency', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="annual">Annual</option>
                                    <option value="as_needed">As Needed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Estimated Duration (hours)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={data.estimated_duration_hours}
                                    onChange={e => setData('estimated_duration_hours', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows={2}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { reset(); setShowForm(false); }}
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Plan Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Equipment</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Frequency</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Active</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Next Due</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Last Performed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {plans.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                                            No maintenance plans found.
                                        </td>
                                    </tr>
                                )}
                                {plans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{plan.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{plan.equipment?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{frequencyLabels[plan.frequency] ?? plan.frequency}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {plan.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {plan.next_due_at ? (
                                                <span className={isOverdue(plan.next_due_at) ? 'font-medium text-red-600' : 'text-slate-600'}>
                                                    {plan.next_due_at}
                                                    {isOverdue(plan.next_due_at) && ' (overdue)'}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{plan.last_performed_at ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

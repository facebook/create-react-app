import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface UserRef {
    id: number;
    name: string;
}

interface RepairItem {
    id: number;
    order_number: string;
    product_name: string;
    serial_number: string | null;
    status: string;
    priority: string;
    assigned_user: UserRef | null;
    scheduled_date: string | null;
    warranty_claim: boolean;
}

interface PaginatedRepairs {
    data: RepairItem[];
    current_page: number;
    last_page: number;
}

interface Props extends PageProps {
    repairs: PaginatedRepairs;
}

const statusColors: Record<string, string> = {
    draft:       'bg-gray-100 text-gray-700',
    confirmed:   'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    done:        'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-700',
};

const priorityColors: Record<string, string> = {
    low:    'bg-slate-100 text-slate-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

function isOverdue(item: RepairItem): boolean {
    if (!item.scheduled_date) return false;
    if (['done', 'cancelled'].includes(item.status)) return false;
    return new Date(item.scheduled_date) < new Date();
}

export default function RepairOrdersIndex({ repairs }: Props) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        product_name:    '',
        serial_number:   '',
        priority:        'low',
        diagnosis:       '',
        scheduled_date:  '',
        warranty_claim:  false as boolean,
        estimated_hours: '',
        estimated_cost:  '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/repairs/orders', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    return (
        <AppLayout>
            <Head title="Repair Orders" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Repair Orders</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        {showForm ? 'Cancel' : 'New Repair'}
                    </button>
                </div>

                {showForm && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-800">Create Repair Order</h2>
                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Product / Device *</label>
                                <input
                                    type="text"
                                    value={data.product_name}
                                    onChange={e => setData('product_name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                                {errors.product_name && <p className="mt-1 text-xs text-red-600">{errors.product_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Serial Number</label>
                                <input
                                    type="text"
                                    value={data.serial_number}
                                    onChange={e => setData('serial_number', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Priority</label>
                                <select
                                    value={data.priority}
                                    onChange={e => setData('priority', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Scheduled Date</label>
                                <input
                                    type="date"
                                    value={data.scheduled_date}
                                    onChange={e => setData('scheduled_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Estimated Hours</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={data.estimated_hours}
                                    onChange={e => setData('estimated_hours', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Estimated Cost</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.estimated_cost}
                                    onChange={e => setData('estimated_cost', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-slate-700">Diagnosis / Description</label>
                                <textarea
                                    value={data.diagnosis}
                                    onChange={e => setData('diagnosis', e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="warranty_claim"
                                    checked={data.warranty_claim}
                                    onChange={e => setData('warranty_claim', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                />
                                <label htmlFor="warranty_claim" className="text-sm font-medium text-slate-700">Warranty Claim</label>
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
                                    {processing ? 'Creating...' : 'Create Repair'}
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
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Order #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Priority</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Assigned To</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Scheduled</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {repairs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No repair orders found.</td>
                                    </tr>
                                )}
                                {repairs.data.map((repair) => (
                                    <tr key={repair.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-mono text-slate-700">{repair.order_number}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            {repair.product_name}
                                            {repair.warranty_claim && (
                                                <span className="ml-2 inline-block rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">Warranty</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColors[repair.status] ?? statusColors.draft}`}>
                                                {repair.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[repair.priority] ?? priorityColors.low}`}>
                                                {repair.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{repair.assigned_user?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {repair.scheduled_date ?? '—'}
                                            {isOverdue(repair) && (
                                                <span className="ml-2 inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">Overdue</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <Link
                                                href={`/repairs/orders/${repair.id}`}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                                            >
                                                View
                                            </Link>
                                        </td>
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

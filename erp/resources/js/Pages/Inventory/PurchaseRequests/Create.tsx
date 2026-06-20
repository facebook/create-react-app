import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Props extends PageProps {}

export default function PurchaseRequestsCreate(_props: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        department: '',
        estimated_cost: '',
        priority: 'medium',
        required_by: '',
        justification: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/purchase-requests');
    }

    return (
        <AppLayout>
            <Head title="New Purchase Request" />
            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Purchase Request</h1>
                <form onSubmit={submit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Title *</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Priority</label>
                        <select
                            value={data.priority}
                            onChange={(e) => setData('priority', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Estimated Cost</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.estimated_cost}
                            onChange={(e) => setData('estimated_cost', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Required By</label>
                        <input
                            type="date"
                            value={data.required_by}
                            onChange={(e) => setData('required_by', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <a href="/inventory/purchase-requests" className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            Cancel
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Create Request
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

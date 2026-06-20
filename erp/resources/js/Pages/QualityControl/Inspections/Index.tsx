import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Checklist {
    id: number;
    name: string;
}

interface Inspector {
    id: number;
    name: string;
}

interface Inspection {
    id: number;
    checklist?: Checklist | null;
    inspector?: Inspector | null;
    status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'cancelled';
    started_at?: string | null;
    completed_at?: string | null;
    reference_type?: string | null;
    reference_id?: number | null;
}

interface PaginatedInspections {
    data: Inspection[];
    total: number;
}

interface Props extends PageProps {
    inspections: PaginatedInspections;
    checklists: Checklist[];
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    passed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
};

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
}

export default function InspectionsIndex({ inspections, checklists }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        checklist_id: '',
        reference_type: '',
        reference_id: '',
        inspector_id: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/quality/inspections', {
            onSuccess: () => reset(),
        });
    }

    function handleStart(id: number) {
        router.post(`/quality/inspections/${id}/start`);
    }

    return (
        <AppLayout>
            <Head title="QC Inspections" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Inspections</h1>
                    <p className="text-sm text-slate-500 mt-1">{inspections.total} inspections</p>
                </div>

                {/* Create Form */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-medium text-slate-900 mb-4">Create Inspection</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Checklist *</label>
                            <select
                                value={data.checklist_id}
                                onChange={e => setData('checklist_id', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">Select checklist...</option>
                                {checklists.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.checklist_id && <p className="mt-1 text-xs text-red-600">{errors.checklist_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reference Type</label>
                            <input
                                type="text"
                                value={data.reference_type}
                                onChange={e => setData('reference_type', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="e.g. purchase_orders"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reference ID</label>
                            <input
                                type="number"
                                value={data.reference_id}
                                onChange={e => setData('reference_id', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Optional"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Inspection'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Checklist</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Inspector</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Started</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Completed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {inspections.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No inspections found.
                                    </td>
                                </tr>
                            ) : (
                                inspections.data.map((inspection) => (
                                    <tr key={inspection.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">#{inspection.id}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {inspection.checklist?.name ?? '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {inspection.inspector?.name ?? '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[inspection.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                                {inspection.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(inspection.started_at)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(inspection.completed_at)}</td>
                                        <td className="px-6 py-4">
                                            {inspection.status === 'pending' && (
                                                <button
                                                    onClick={() => handleStart(inspection.id)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    Start
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
        </AppLayout>
    );
}

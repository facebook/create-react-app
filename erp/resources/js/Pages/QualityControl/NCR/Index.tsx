import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Inspection {
    id: number;
}

interface User {
    id: number;
    name: string;
}

interface Ncr {
    id: number;
    ncr_number: string;
    title: string;
    description: string;
    severity: 'minor' | 'major' | 'critical';
    status: 'open' | 'under_review' | 'resolved' | 'closed';
    due_date?: string | null;
    resolved_at?: string | null;
    reporter?: User | null;
    assignee?: User | null;
}

interface PaginatedNcrs {
    data: Ncr[];
    total: number;
}

interface Props extends PageProps {
    ncrs: PaginatedNcrs;
    inspections: Inspection[];
}

const severityColors: Record<string, string> = {
    minor: 'bg-yellow-100 text-yellow-700',
    major: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
    open: 'bg-red-100 text-red-700',
    under_review: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-slate-100 text-slate-500',
};

function isOverdue(ncr: Ncr): boolean {
    if (!ncr.due_date) return false;
    if (['resolved', 'closed'].includes(ncr.status)) return false;
    return new Date(ncr.due_date) < new Date();
}

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
}

export default function NcrIndex({ ncrs, inspections }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        severity: 'major' as const,
        inspection_id: '',
        due_date: '',
    });

    const resolveForm = useForm({
        root_cause: '',
        corrective_action: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/quality/ncrs', {
            onSuccess: () => reset(),
        });
    }

    function handleResolve(ncrId: number) {
        const rootCause = prompt('Root cause:');
        if (!rootCause) return;
        const correctiveAction = prompt('Corrective action:');
        if (!correctiveAction) return;

        router.post(`/quality/ncrs/${ncrId}/resolve`, {
            root_cause: rootCause,
            corrective_action: correctiveAction,
        });
    }

    return (
        <AppLayout>
            <Head title="Non-Conformance Reports" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Non-Conformance Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">{ncrs.total} reports</p>
                </div>

                {/* Create Form */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-medium text-slate-900 mb-4">Create NCR</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="NCR title"
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Severity *</label>
                                <select
                                    value={data.severity}
                                    onChange={e => setData('severity', e.target.value as any)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="minor">Minor</option>
                                    <option value="major">Major</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Inspection</label>
                                <select
                                    value={data.inspection_id}
                                    onChange={e => setData('inspection_id', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="">None</option>
                                    {inspections.map(i => (
                                        <option key={i.id} value={i.id}>Inspection #{i.id}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={e => setData('due_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Describe the non-conformance..."
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create NCR'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NCR #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Severity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {ncrs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No NCRs found.
                                    </td>
                                </tr>
                            ) : (
                                ncrs.data.map((ncr) => {
                                    const overdue = isOverdue(ncr);
                                    return (
                                        <tr key={ncr.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{ncr.ncr_number}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-900">{ncr.title}</div>
                                                {ncr.reporter && (
                                                    <div className="text-xs text-slate-400">Reported by {ncr.reporter.name}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${severityColors[ncr.severity] ?? 'bg-slate-100 text-slate-700'}`}>
                                                    {ncr.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[ncr.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                                    {ncr.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                                                    {formatDate(ncr.due_date)}
                                                    {overdue && <span className="ml-1 text-xs">(overdue)</span>}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {['open', 'under_review'].includes(ncr.status) && (
                                                    <button
                                                        onClick={() => handleResolve(ncr.id)}
                                                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                                                    >
                                                        Resolve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

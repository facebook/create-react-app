import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { QcInspection, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    inspections: Paginator<QcInspection>;
    filters: { status?: string };
}

const statusBadge: Record<string, string> = {
    pending:     'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    passed:      'bg-green-100 text-green-700',
    failed:      'bg-red-100 text-red-700',
};

export default function QcInspectionsIndex({ inspections, filters }: Props) {
    const { can } = usePermission();
    const { data, setData, get } = useForm({ status: filters.status ?? '' });

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        get('/inventory/qc-inspections');
    }

    return (
        <AppLayout>
            <Head title="QC Inspections" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">QC Inspections</h1>
                        <p className="text-sm text-slate-500 mt-1">{inspections.total} inspections</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/qc-inspections/create">
                            <Button>New Inspection</Button>
                        </Link>
                    )}
                </div>

                <form onSubmit={applyFilter} className="flex items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                        <select value={data.status} onChange={(e) => setData('status', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="passed">Passed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <button type="submit" className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">Filter</button>
                    {filters.status && (
                        <Link href="/inventory/qc-inspections" className="text-sm text-slate-500 hover:text-slate-700">Clear</Link>
                    )}
                </form>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Checklist</th>
                                <th className="px-4 py-2 text-left font-medium">Product</th>
                                <th className="px-4 py-2 text-left font-medium">Batch</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                <th className="px-4 py-2 text-left font-medium">Pass Rate</th>
                                <th className="px-4 py-2 text-left font-medium">Date</th>
                                <th className="px-4 py-2 text-left font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {inspections.data.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No inspections found.</td></tr>
                            ) : inspections.data.map((insp) => (
                                <tr key={insp.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-900">{insp.checklist?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-600">{insp.product?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{insp.batch_reference ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[insp.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {insp.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{insp.pass_rate != null ? `${insp.pass_rate}%` : '—'}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(insp.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <Link href={`/inventory/qc-inspections/${insp.id}`} className="text-indigo-600 hover:underline text-xs">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {inspections.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {inspections.prev_page_url && (
                            <Link href={inspections.prev_page_url} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">&larr; Previous</Link>
                        )}
                        <span className="px-3 py-1.5 text-sm text-slate-500">Page {inspections.current_page} of {inspections.last_page}</span>
                        {inspections.next_page_url && (
                            <Link href={inspections.next_page_url} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Next &rarr;</Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

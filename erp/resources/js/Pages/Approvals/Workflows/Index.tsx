import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Workflow {
    id: number;
    name: string;
    entity_type: string;
    min_amount: number | null;
    max_amount: number | null;
    is_active: boolean;
    steps_count: number;
}

interface Props extends PageProps {
    workflows: Workflow[];
}

const ENTITY_LABELS: Record<string, string> = {
    purchase_order:      'Purchase Order',
    expense:             'Expense',
    leave_request:       'Leave Request',
    bill:                'Bill',
    manufacturing_order: 'Mfg Order',
};

function formatAmount(val: number | null): string {
    if (val === null || val === undefined) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export default function WorkflowsIndex({ workflows }: Props) {
    function handleDelete(id: number) {
        if (confirm('Delete this workflow? All associated steps will be removed.')) {
            router.delete(`/approvals/workflows/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Approval Workflows" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Approval Workflows</h1>
                        <p className="text-sm text-slate-500 mt-1">{workflows.length} workflow{workflows.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link href="/approvals/workflows/create">
                        <Button>New Workflow</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Entity Type</th>
                                <th className="px-6 py-3">Amount Range</th>
                                <th className="px-6 py-3">Steps</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {workflows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                        No workflows yet.{' '}
                                        <Link href="/approvals/workflows/create" className="text-indigo-600 hover:underline">Create one</Link>
                                    </td>
                                </tr>
                            ) : workflows.map((wf) => (
                                <tr key={wf.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">
                                        <Link href={`/approvals/workflows/${wf.id}`} className="hover:text-indigo-600">{wf.name}</Link>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                            {ENTITY_LABELS[wf.entity_type] ?? wf.entity_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">
                                        {wf.min_amount !== null || wf.max_amount !== null
                                            ? `${formatAmount(wf.min_amount)} – ${formatAmount(wf.max_amount)}`
                                            : 'Any amount'}
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">{wf.steps_count}</td>
                                    <td className="px-6 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${wf.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                                            {wf.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex gap-2">
                                            <Link href={`/approvals/workflows/${wf.id}/edit`} className="text-indigo-600 hover:underline text-xs">Edit</Link>
                                            <button onClick={() => handleDelete(wf.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

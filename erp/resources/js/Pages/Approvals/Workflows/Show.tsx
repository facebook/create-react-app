import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ApproverUser {
    id: number;
    name: string;
}

interface Step {
    id: number;
    step_number: number;
    name: string;
    approver_id: number | null;
    approver_role: string | null;
    is_required: boolean;
    approver: ApproverUser | null;
}

interface Workflow {
    id: number;
    name: string;
    entity_type: string;
    min_amount: number | null;
    max_amount: number | null;
    is_active: boolean;
    steps: Step[];
}

interface Props extends PageProps {
    workflow: Workflow;
}

const ENTITY_LABELS: Record<string, string> = {
    purchase_order:      'Purchase Order',
    expense:             'Expense',
    leave_request:       'Leave Request',
    bill:                'Bill',
    manufacturing_order: 'Manufacturing Order',
};

function formatAmount(val: number | null): string {
    if (val === null || val === undefined) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export default function WorkflowShow({ workflow }: Props) {
    function handleDelete() {
        if (confirm('Delete this workflow? All associated steps and requests will be affected.')) {
            router.delete(`/approvals/workflows/${workflow.id}`, {
                onSuccess: () => router.visit('/approvals/workflows'),
            });
        }
    }

    return (
        <AppLayout>
            <Head title={workflow.name} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/approvals/workflows" className="text-sm text-slate-500 hover:text-slate-700">Workflows</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm text-slate-700">{workflow.name}</span>
                </div>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{workflow.name}</h1>
                        <div className="mt-2 flex gap-2">
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                {ENTITY_LABELS[workflow.entity_type] ?? workflow.entity_type}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                                {workflow.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/approvals/workflows/${workflow.id}/edit`}>
                            <Button variant="secondary" size="sm">Edit</Button>
                        </Link>
                        <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                    </div>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900 mb-4">Details</h2>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <dt className="font-medium text-slate-500">Entity Type</dt>
                            <dd className="text-slate-900">{ENTITY_LABELS[workflow.entity_type] ?? workflow.entity_type}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-slate-500">Steps</dt>
                            <dd className="text-slate-900">{workflow.steps.length}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-slate-500">Min Amount</dt>
                            <dd className="text-slate-900">{formatAmount(workflow.min_amount)}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-slate-500">Max Amount</dt>
                            <dd className="text-slate-900">{formatAmount(workflow.max_amount)}</dd>
                        </div>
                    </dl>
                </div>

                {/* Steps */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-900">Approval Steps</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                <th className="px-6 py-3">Step #</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Approver</th>
                                <th className="px-6 py-3">Required</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {workflow.steps.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-6 text-center text-slate-400">No steps defined</td>
                                </tr>
                            ) : workflow.steps.map((step) => (
                                <tr key={step.id}>
                                    <td className="px-6 py-3 text-slate-900 font-medium">{step.step_number}</td>
                                    <td className="px-6 py-3 text-slate-900">{step.name}</td>
                                    <td className="px-6 py-3 text-slate-600">
                                        {step.approver
                                            ? step.approver.name
                                            : step.approver_role
                                                ? <span className="italic">Role: {step.approver_role}</span>
                                                : <span className="text-slate-400">—</span>}
                                    </td>
                                    <td className="px-6 py-3">
                                        {step.is_required
                                            ? <span className="text-green-600">Yes</span>
                                            : <span className="text-slate-400">No</span>}
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

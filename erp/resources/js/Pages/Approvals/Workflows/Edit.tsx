import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface StepData {
    id?: number;
    step_number: number;
    name: string;
    approver_id: string;
    approver_role: string;
    is_required: boolean;
}

interface Workflow {
    id: number;
    name: string;
    entity_type: string;
    min_amount: number | null;
    max_amount: number | null;
    is_active: boolean;
    steps: StepData[];
}

interface Props extends PageProps {
    workflow: Workflow;
    users: User[];
    roles: string[];
}

const ENTITY_TYPES = [
    { value: 'purchase_order',      label: 'Purchase Order' },
    { value: 'expense',             label: 'Expense' },
    { value: 'leave_request',       label: 'Leave Request' },
    { value: 'bill',                label: 'Bill' },
    { value: 'manufacturing_order', label: 'Manufacturing Order' },
];

export default function WorkflowEdit({ workflow, users, roles }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: workflow.name,
        entity_type: workflow.entity_type,
        min_amount: workflow.min_amount !== null ? String(workflow.min_amount) : '',
        max_amount: workflow.max_amount !== null ? String(workflow.max_amount) : '',
        is_active: workflow.is_active,
        steps: workflow.steps.map((s) => ({
            name: s.name,
            approver_id: s.approver_id ? String(s.approver_id) : '',
            approver_role: s.approver_role ?? '',
            is_required: s.is_required,
        })),
    });

    function addStep() {
        setData('steps', [...data.steps, { name: '', approver_id: '', approver_role: '', is_required: true }]);
    }

    function removeStep(index: number) {
        setData('steps', data.steps.filter((_, i) => i !== index));
    }

    function updateStep(index: number, field: string, value: string | boolean) {
        const updated = data.steps.map((s, i) => i === index ? { ...s, [field]: value } : s);
        setData('steps', updated);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/approvals/workflows/${workflow.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Edit: ${workflow.name}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/approvals/workflows" className="text-sm text-slate-500 hover:text-slate-700">Workflows</Link>
                    <span className="text-slate-300">/</span>
                    <Link href={`/approvals/workflows/${workflow.id}`} className="text-sm text-slate-500 hover:text-slate-700">{workflow.name}</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm text-slate-700">Edit</span>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900">Workflow Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Entity Type *</label>
                            <select
                                value={data.entity_type}
                                onChange={(e) => setData('entity_type', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                {ENTITY_TYPES.map((et) => (
                                    <option key={et.value} value={et.value}>{et.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Min Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.min_amount}
                                    onChange={(e) => setData('min_amount', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Max Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.max_amount}
                                    onChange={(e) => setData('max_amount', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                            />
                            <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-900">Approval Steps</h2>
                            <Button type="button" variant="secondary" size="sm" onClick={addStep}>+ Add Step</Button>
                        </div>

                        {data.steps.map((step, index) => (
                            <div key={index} className="rounded-md border border-slate-200 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">Step {index + 1}</span>
                                    {data.steps.length > 1 && (
                                        <button type="button" onClick={() => removeStep(index)} className="text-xs text-red-500 hover:underline">Remove</button>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Step Name *</label>
                                    <input
                                        type="text"
                                        value={step.name}
                                        onChange={(e) => updateStep(index, 'name', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Specific Approver</label>
                                        <select
                                            value={step.approver_id}
                                            onChange={(e) => updateStep(index, 'approver_id', e.target.value)}
                                            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="">— Any user with role —</option>
                                            {users.map((u) => (
                                                <option key={u.id} value={String(u.id)}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Or Approver Role</label>
                                        <input
                                            type="text"
                                            value={step.approver_role}
                                            onChange={(e) => updateStep(index, 'approver_role', e.target.value)}
                                            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            list={`roles-${index}`}
                                        />
                                        <datalist id={`roles-${index}`}>
                                            {roles.map((r) => <option key={r} value={r} />)}
                                        </datalist>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`required-${index}`}
                                        checked={step.is_required}
                                        onChange={(e) => updateStep(index, 'is_required', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                    />
                                    <label htmlFor={`required-${index}`} className="text-xs text-slate-600">Required</label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href={`/approvals/workflows/${workflow.id}`}><Button type="button" variant="secondary">Cancel</Button></Link>
                        <Button type="submit" disabled={processing}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

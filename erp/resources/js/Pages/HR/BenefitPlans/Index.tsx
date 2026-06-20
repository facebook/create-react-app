import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { BenefitPlan } from '@/types/hr';

interface Props extends PageProps {
    plans: Paginator<BenefitPlan>;
    filters: { type?: string };
}

const TYPE_COLORS: Record<string, string> = {
    health:     'bg-green-100 text-green-700',
    dental:     'bg-blue-100 text-blue-700',
    vision:     'bg-purple-100 text-purple-700',
    life:       'bg-red-100 text-red-700',
    retirement: 'bg-yellow-100 text-yellow-700',
    other:      'bg-slate-100 text-slate-700',
};

const TYPES = ['health', 'dental', 'vision', 'life', 'retirement', 'other'];

export default function BenefitPlansIndex({ plans, filters }: Props) {
    const { can } = usePermission();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'health',
        employee_cost: '',
        employer_cost: '',
        description: '',
    });

    function setType(type: string) {
        router.get('/hr/benefit-plans', { ...filters, type: type || undefined }, { preserveState: true, replace: true });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/benefit-plans', { onSuccess: () => reset() });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this benefit plan?')) {
            router.delete(`/hr/benefit-plans/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Benefit Plans" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Benefit Plans</h1>
                        <p className="text-sm text-slate-500 mt-1">{plans.total} plans</p>
                    </div>
                </div>

                {/* Type Filter */}
                <div className="flex gap-1 border-b border-slate-200">
                    <button
                        onClick={() => setType('')}
                        className={[
                            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                            !filters.type ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700',
                        ].join(' ')}
                    >
                        All
                    </button>
                    {TYPES.map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize',
                                filters.type === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700',
                            ].join(' ')}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Add Form */}
                {can('hr.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-700 mb-3">Add Benefit Plan</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                                    placeholder="Plan name"
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Type *</label>
                                <select
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                                >
                                    {TYPES.map(t => (
                                        <option key={t} value={t} className="capitalize">{t}</option>
                                    ))}
                                </select>
                                {errors.type && <p className="text-xs text-red-500 mt-0.5">{errors.type}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Employee Cost ($/mo)</label>
                                <input
                                    type="number"
                                    value={data.employee_cost}
                                    onChange={e => setData('employee_cost', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Employer Cost ($/mo)</label>
                                <input
                                    type="number"
                                    value={data.employer_cost}
                                    onChange={e => setData('employer_cost', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                                    placeholder="Optional description"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" disabled={processing}>Add Plan</Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Employee Cost</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Employer Cost</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Total Cost</th>
                                <th className="px-4 py-3 text-center font-medium text-slate-600">Active?</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {plans.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No benefit plans found.</td>
                                </tr>
                            )}
                            {plans.data.map((plan) => (
                                <tr key={plan.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">{plan.name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_COLORS[plan.type] ?? 'bg-slate-100 text-slate-700'}`}>
                                            {plan.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">${plan.employee_cost.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">${plan.employer_cost.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right font-medium">${plan.total_cost.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {plan.is_active ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <Link href={`/hr/benefit-plans/${plan.id}`} className="text-indigo-600 hover:underline text-xs">View</Link>
                                        {can('hr.delete') && (
                                            <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination links={plans.links} />
            </div>
        </AppLayout>
    );
}

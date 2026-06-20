import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { Employee, BenefitPlan, EmployeeBenefit } from '@/types/hr';

interface Props extends PageProps {
    benefits: Paginator<EmployeeBenefit>;
    filters: { employee_id?: string; status?: string };
    employees?: Employee[];
    plans?: BenefitPlan[];
}

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    waived: 'bg-yellow-100 text-yellow-700',
    ended:  'bg-slate-100 text-slate-500',
};

const STATUS_TABS = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'waived', label: 'Waived' },
    { value: 'ended', label: 'Ended' },
];

export default function EmployeeBenefitsIndex({ benefits, filters, employees = [], plans = [] }: Props) {
    const { can } = usePermission();
    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: '',
        benefit_plan_id: '',
        enrolled_at: '',
        notes: '',
    });

    function setStatus(status: string) {
        router.get('/hr/employee-benefits', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/employee-benefits', { onSuccess: () => reset() });
    }

    function handleWaive(id: number) {
        if (confirm('Waive this benefit enrollment?')) {
            router.post(`/hr/employee-benefits/${id}/waive`);
        }
    }

    function handleEnd(id: number) {
        if (confirm('End this benefit enrollment?')) {
            router.post(`/hr/employee-benefits/${id}/end`);
        }
    }

    return (
        <AppLayout>
            <Head title="Employee Benefits" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Employee Benefits</h1>
                        <p className="text-sm text-slate-500 mt-1">{benefits.total} enrollments</p>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex gap-1 border-b border-slate-200">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatus(tab.value)}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                (filters.status ?? '') === tab.value
                                    ? 'border-indigo-600 text-indigo-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            ].join(' ')}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Enroll Form */}
                {can('hr.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-700 mb-3">Enroll Employee</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Employee *</label>
                                <select
                                    value={data.employee_id}
                                    onChange={e => setData('employee_id', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                                >
                                    <option value="">Select employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                    ))}
                                </select>
                                {errors.employee_id && <p className="text-xs text-red-500 mt-0.5">{errors.employee_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Benefit Plan *</label>
                                <select
                                    value={data.benefit_plan_id}
                                    onChange={e => setData('benefit_plan_id', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                                >
                                    <option value="">Select plan...</option>
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.id}>{plan.name}</option>
                                    ))}
                                </select>
                                {errors.benefit_plan_id && <p className="text-xs text-red-500 mt-0.5">{errors.benefit_plan_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Enrolled At *</label>
                                <input
                                    type="date"
                                    value={data.enrolled_at}
                                    onChange={e => setData('enrolled_at', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                                />
                                {errors.enrolled_at && <p className="text-xs text-red-500 mt-0.5">{errors.enrolled_at}</p>}
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" disabled={processing}>Enroll</Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Employee</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Plan</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Enrolled Date</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Monthly Cost</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {benefits.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No benefit enrollments found.</td>
                                </tr>
                            )}
                            {benefits.data.map((benefit) => (
                                <tr key={benefit.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        {benefit.employee
                                            ? `${(benefit.employee as any).first_name} ${(benefit.employee as any).last_name}`
                                            : `Employee #${benefit.employee_id}`}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{benefit.plan?.name ?? `Plan #${benefit.benefit_plan_id}`}</td>
                                    <td className="px-4 py-3 text-slate-600">{benefit.enrolled_at as unknown as string}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[benefit.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                            {benefit.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">${(benefit.monthly_cost ?? 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        {can('hr.create') && benefit.status === 'active' && (
                                            <>
                                                <button onClick={() => handleWaive(benefit.id)} className="text-yellow-600 hover:underline text-xs">Waive</button>
                                                <button onClick={() => handleEnd(benefit.id)} className="text-slate-600 hover:underline text-xs">End</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination links={benefits.links} />
            </div>
        </AppLayout>
    );
}

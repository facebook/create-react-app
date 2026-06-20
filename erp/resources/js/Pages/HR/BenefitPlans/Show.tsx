import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import type { BenefitPlan, EmployeeBenefit } from '@/types/hr';

interface EnrolledPlan extends BenefitPlan {
    enrollments: EmployeeBenefit[];
}

interface Props extends PageProps {
    plan: EnrolledPlan;
}

const TYPE_COLORS: Record<string, string> = {
    health:     'bg-green-100 text-green-700',
    dental:     'bg-blue-100 text-blue-700',
    vision:     'bg-purple-100 text-purple-700',
    life:       'bg-red-100 text-red-700',
    retirement: 'bg-yellow-100 text-yellow-700',
    other:      'bg-slate-100 text-slate-700',
};

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    waived: 'bg-yellow-100 text-yellow-700',
    ended:  'bg-slate-100 text-slate-500',
};

export default function BenefitPlanShow({ plan }: Props) {
    return (
        <AppLayout>
            <Head title={`Benefit Plan: ${plan.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/hr/benefit-plans" className="text-sm text-indigo-600 hover:underline">
                            &larr; Back to Benefit Plans
                        </Link>
                        <h1 className="text-2xl font-semibold text-slate-900 mt-1">{plan.name}</h1>
                    </div>
                </div>

                {/* Plan Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-800 mb-4">Plan Details</h2>
                    <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        <div>
                            <dt className="text-xs text-slate-500">Type</dt>
                            <dd className="mt-0.5">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_COLORS[plan.type] ?? 'bg-slate-100 text-slate-700'}`}>
                                    {plan.type}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Employee Cost / mo</dt>
                            <dd className="mt-0.5 text-sm font-medium text-slate-900">${plan.employee_cost.toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Employer Cost / mo</dt>
                            <dd className="mt-0.5 text-sm font-medium text-slate-900">${plan.employer_cost.toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Total Cost / mo</dt>
                            <dd className="mt-0.5 text-sm font-medium text-slate-900">${plan.total_cost.toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Status</dt>
                            <dd className="mt-0.5">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {plan.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </dd>
                        </div>
                        {plan.description && (
                            <div className="col-span-full">
                                <dt className="text-xs text-slate-500">Description</dt>
                                <dd className="mt-0.5 text-sm text-slate-700">{plan.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Enrolled Employees */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-800">Enrolled Employees ({plan.enrollments?.length ?? 0})</h2>
                    </div>
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Employee</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Enrolled</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Ended</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(!plan.enrollments || plan.enrollments.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No employees enrolled.</td>
                                </tr>
                            )}
                            {plan.enrollments?.map((enrollment) => (
                                <tr key={enrollment.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        {enrollment.employee
                                            ? `${(enrollment.employee as any).first_name} ${(enrollment.employee as any).last_name}`
                                            : `Employee #${enrollment.employee_id}`}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{enrollment.enrolled_at as unknown as string}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[enrollment.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                            {enrollment.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{enrollment.ended_at ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

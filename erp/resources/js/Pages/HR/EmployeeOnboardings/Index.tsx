import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Employee, OnboardingChecklist, EmployeeOnboardingV2 } from '@/types/hr';

interface Props extends PageProps {
    onboardings: {
        data: EmployeeOnboardingV2[];
        current_page: number;
        last_page: number;
    };
    employees: Pick<Employee, 'id' | 'first_name' | 'last_name'>[];
    checklists: Pick<OnboardingChecklist, 'id' | 'name'>[];
    filters: {
        employee_id?: string;
        status?: string;
    };
}

const statusLabels: Record<string, string> = {
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const statusColors: Record<string, string> = {
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-slate-100 text-slate-600',
};

export default function EmployeeOnboardingsIndex({ onboardings, filters }: Props) {
    const { can } = usePermission();

    function handleFilterChange(key: string, value: string) {
        router.get('/hr/employee-onboardings', { ...filters, [key]: value || undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    return (
        <AppLayout>
            <Head title="Employee Onboardings" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Employee Onboardings</h1>
                        <p className="text-sm text-slate-500 mt-1">{onboardings.data.length} onboardings</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/employee-onboardings/create">
                            <Button>Assign Onboarding</Button>
                        </Link>
                    )}
                </div>

                <div className="flex gap-4">
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Checklist</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {onboardings.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No onboardings found.
                                    </td>
                                </tr>
                            ) : (
                                onboardings.data.map((onboarding) => (
                                    <tr key={onboarding.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-slate-900">
                                                {onboarding.employee
                                                    ? `${onboarding.employee.first_name} ${onboarding.employee.last_name}`
                                                    : `Employee #${onboarding.employee_id}`}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {onboarding.checklist?.name ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {onboarding.start_date}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[onboarding.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {statusLabels[onboarding.status] ?? onboarding.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {onboarding.completion_percent}%
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/hr/employee-onboardings/${onboarding.id}`}
                                                className="text-sm text-slate-600 hover:text-slate-900"
                                            >
                                                View
                                            </Link>
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

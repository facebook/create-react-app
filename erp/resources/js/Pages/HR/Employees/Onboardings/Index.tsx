import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Employee, EmployeeOnboarding } from '@/types/hr';

interface Props extends PageProps {
    employee: Employee;
    onboardings: EmployeeOnboarding[];
}

const STATUS_LABELS: Record<string, string> = {
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-slate-100 text-slate-600',
};

export default function EmployeeOnboardingsIndex({ employee, onboardings }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title={`Onboardings — ${employee.first_name} ${employee.last_name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Onboardings
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {employee.first_name} {employee.last_name} &mdash; {onboardings.length} onboarding(s)
                        </p>
                    </div>
                    {can('hr.create') && (
                        <Link href={`/hr/employees/${employee.id}/onboardings/create`}>
                            <Button>New Onboarding</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Started</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {onboardings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No onboardings yet.
                                    </td>
                                </tr>
                            ) : (
                                onboardings.map((onboarding) => (
                                    <tr key={onboarding.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/hr/employees/${employee.id}/onboardings/${onboarding.id}`}
                                                className="font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                                {onboarding.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[onboarding.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {STATUS_LABELS[onboarding.status] ?? onboarding.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-slate-200 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${onboarding.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-600">{onboarding.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{onboarding.started_at}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/hr/employees/${employee.id}/onboardings/${onboarding.id}`}
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

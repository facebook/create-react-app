import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { EmployeeOnboardingV2, OnboardingProgress } from '@/types/hr';

interface Props extends PageProps {
    onboarding: EmployeeOnboardingV2;
}

const statusColors: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600',
    completed: 'bg-green-100 text-green-800',
    skipped: 'bg-yellow-100 text-yellow-700',
};

export default function EmployeeOnboardingsShow({ onboarding }: Props) {
    const { can } = usePermission();

    function handleComplete(progressId: number, notes?: string) {
        router.post(`/hr/employee-onboardings/${onboarding.id}/tasks/${progressId}/complete`, { notes: notes ?? null });
    }

    function handleSkip(progressId: number) {
        router.post(`/hr/employee-onboardings/${onboarding.id}/tasks/${progressId}/skip`);
    }

    const completionPercent = onboarding.completion_percent ?? 0;

    return (
        <AppLayout>
            <Head title="Employee Onboarding" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {onboarding.employee
                                ? `${onboarding.employee.first_name} ${onboarding.employee.last_name}`
                                : `Employee #${onboarding.employee_id}`}
                            {' — '}
                            {onboarding.checklist?.name ?? 'Onboarding'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Start date: {onboarding.start_date}
                        </p>
                    </div>
                    <Link href="/hr/employee-onboardings">
                        <Button variant="secondary">Back</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            onboarding.status === 'completed' ? 'bg-green-100 text-green-800' :
                            onboarding.status === 'cancelled' ? 'bg-slate-100 text-slate-600' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {onboarding.status === 'in_progress' ? 'In Progress' :
                             onboarding.status === 'completed' ? 'Completed' : 'Cancelled'}
                        </span>
                        <span className="text-sm text-slate-600">{completionPercent}% complete</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${completionPercent}%` }}
                        />
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base font-medium text-slate-900">Tasks</h2>
                    </div>
                    <div className="divide-y divide-slate-200">
                        {(onboarding.progress ?? []).length === 0 ? (
                            <p className="px-6 py-8 text-center text-sm text-slate-500">No tasks assigned.</p>
                        ) : (
                            (onboarding.progress ?? []).map((prog: OnboardingProgress) => (
                                <div key={prog.id} className="px-6 py-4 flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">
                                            {prog.task?.title ?? `Task #${prog.onboarding_task_id}`}
                                        </p>
                                        {prog.task?.category && (
                                            <p className="text-xs text-slate-500 mt-0.5">{prog.task.category}</p>
                                        )}
                                        {prog.notes && (
                                            <p className="text-xs text-slate-600 mt-1 italic">{prog.notes}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[prog.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {prog.status.charAt(0).toUpperCase() + prog.status.slice(1)}
                                        </span>
                                        {can('hr.create') && prog.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleComplete(prog.id)}
                                                    className="text-xs text-green-700 hover:text-green-900 font-medium"
                                                >
                                                    Complete
                                                </button>
                                                <button
                                                    onClick={() => handleSkip(prog.id)}
                                                    className="text-xs text-slate-500 hover:text-slate-700"
                                                >
                                                    Skip
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Employee, EmployeeOnboarding, EmployeeOnboardingTask } from '@/types/hr';

interface Props extends PageProps {
    employee: Employee;
    onboarding: EmployeeOnboarding;
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

export default function EmployeeOnboardingShow({ employee, onboarding }: Props) {
    const { can } = usePermission();

    function toggleTask(task: EmployeeOnboardingTask) {
        if (task.is_completed) {
            router.post(`/hr/employees/${employee.id}/onboardings/${onboarding.id}/tasks/${task.id}/uncomplete`);
        } else {
            router.post(`/hr/employees/${employee.id}/onboardings/${onboarding.id}/tasks/${task.id}/complete`);
        }
    }

    function markComplete() {
        if (!confirm('Mark this entire onboarding as complete?')) return;
        router.post(`/hr/employees/${employee.id}/onboardings/${onboarding.id}/complete`);
    }

    return (
        <AppLayout>
            <Head title={onboarding.title} />
            <div className="max-w-3xl space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{onboarding.title}</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {employee.first_name} {employee.last_name} &mdash; Started {onboarding.started_at}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[onboarding.status] ?? 'bg-slate-100 text-slate-600'}`}>
                            {STATUS_LABELS[onboarding.status] ?? onboarding.status}
                        </span>
                        {can('hr.update') && onboarding.status === 'in_progress' && (
                            <Button onClick={markComplete}>Mark Complete</Button>
                        )}
                    </div>
                </div>

                {/* Progress */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                        <span className="text-sm font-semibold text-slate-900">{onboarding.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                            className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${onboarding.progress}%` }}
                        />
                    </div>
                </div>

                {/* Tasks */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base font-medium text-slate-900">
                            Tasks ({onboarding.tasks?.length ?? 0})
                        </h2>
                    </div>
                    {!onboarding.tasks || onboarding.tasks.length === 0 ? (
                        <div className="px-6 py-8 text-center text-sm text-slate-500">
                            No tasks for this onboarding.
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {onboarding.tasks.map((task) => (
                                <li key={task.id} className="px-6 py-4 flex items-start gap-4">
                                    {can('hr.update') ? (
                                        <button
                                            onClick={() => toggleTask(task)}
                                            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                task.is_completed
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-slate-300 hover:border-indigo-400'
                                            }`}
                                            title={task.is_completed ? 'Mark incomplete' : 'Mark complete'}
                                        >
                                            {task.is_completed && (
                                                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                                                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                                                </svg>
                                            )}
                                        </button>
                                    ) : (
                                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                            task.is_completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'
                                        }`}>
                                            {task.is_completed && (
                                                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                                                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                            {task.title}
                                        </p>
                                        {task.description && (
                                            <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                                        )}
                                        {task.due_date && (
                                            <p className="text-xs text-slate-400 mt-0.5">Due: {task.due_date}</p>
                                        )}
                                    </div>
                                    {task.is_completed && task.completed_at && (
                                        <span className="flex-shrink-0 text-xs text-green-600">
                                            Done
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Link href={`/hr/employees/${employee.id}/onboardings`}>
                        <Button variant="secondary">Back to Onboardings</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { OnboardingTemplate } from '@/types/hr';

interface Props extends PageProps {
    template: OnboardingTemplate;
}

export default function OnboardingTemplateShow({ template }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (!confirm(`Delete template "${template.name}"?`)) return;
        router.delete(`/hr/onboarding-templates/${template.id}`);
    }

    return (
        <AppLayout>
            <Head title={template.name} />
            <div className="max-w-3xl space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{template.name}</h1>
                        {template.description && (
                            <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            template.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-600'
                        }`}>
                            {template.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {can('hr.delete') && (
                            <Button variant="secondary" onClick={handleDelete} className="text-red-600 hover:text-red-800">
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-base font-medium text-slate-900">
                            Tasks ({template.tasks?.length ?? 0})
                        </h2>
                    </div>
                    {!template.tasks || template.tasks.length === 0 ? (
                        <div className="px-6 py-8 text-center text-sm text-slate-500">
                            No tasks defined for this template.
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {template.tasks.map((task, index) => (
                                <li key={task.id} className="px-6 py-4 flex items-start gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-medium">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900">{task.title}</p>
                                        {task.description && (
                                            <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                                        )}
                                    </div>
                                    {task.due_days > 0 && (
                                        <span className="flex-shrink-0 text-xs text-slate-500">
                                            Due day {task.due_days}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Link href="/hr/onboarding-templates">
                        <Button variant="secondary">Back to Templates</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

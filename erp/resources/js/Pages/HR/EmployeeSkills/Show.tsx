import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { EmployeeSkill } from '@/types/hr';

interface Props extends PageProps {
    employeeSkill: EmployeeSkill;
}

export default function EmployeeSkillShow({ employeeSkill }: Props) {
    const { can } = usePermission();

    function handleVerify() {
        router.post(`/hr/employee-skills/${employeeSkill.id}/verify`);
    }

    function handleDelete() {
        if (confirm('Delete this skill?')) {
            router.delete(`/hr/employee-skills/${employeeSkill.id}`, {
                onSuccess: () => router.visit('/hr/employee-skills'),
            });
        }
    }

    const proficiencyLabels: Record<number, string> = {
        1: 'Beginner', 2: 'Basic', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert',
    };

    return (
        <AppLayout>
            <Head title={`Skill: ${employeeSkill.skill_name}`} />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">{employeeSkill.skill_name}</h1>
                    <div className="flex gap-2">
                        {can('hr.create') && !employeeSkill.is_verified && (
                            <button
                                onClick={handleVerify}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Verify Skill
                            </button>
                        )}
                        {can('hr.delete') && (
                            <button
                                onClick={handleDelete}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Employee</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {employeeSkill.employee
                                    ? `${employeeSkill.employee.first_name} ${employeeSkill.employee.last_name}`
                                    : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Skill</dt>
                            <dd className="mt-1 text-sm text-slate-900">{employeeSkill.skill_name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Proficiency</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {employeeSkill.proficiency_label ?? proficiencyLabels[employeeSkill.proficiency_level]}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Verified</dt>
                            <dd className="mt-1">
                                {employeeSkill.is_verified ? (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Verified</span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">Unverified</span>
                                )}
                            </dd>
                        </div>
                        {employeeSkill.acquired_date && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Acquired Date</dt>
                                <dd className="mt-1 text-sm text-slate-900">{employeeSkill.acquired_date}</dd>
                            </div>
                        )}
                        {employeeSkill.definition && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Category</dt>
                                <dd className="mt-1 text-sm text-slate-900">{employeeSkill.definition.category ?? '—'}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}
